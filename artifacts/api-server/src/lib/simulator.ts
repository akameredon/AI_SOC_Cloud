import { db, eventsTable, alertsTable, camerasTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { eventBus } from "./eventBus";
import { logger } from "./logger";

const EVENT_TYPES = ["intrusion", "loitering", "vehicle", "person", "crowd", "tamper", "object_left"] as const;

const AI_EXPLANATIONS: Record<string, string[]> = {
  intrusion: [
    "Motion pattern analysis detected rapid directional movement inconsistent with authorized access. Subject traversed the restricted perimeter without credential verification. Confidence based on trajectory modeling and boundary crossing vectors.",
    "Neural network flagged unusual entry pattern. Individual bypassed primary access checkpoint and entered from a non-standard angle. Pose estimation indicates deliberate avoidance behavior.",
  ],
  loitering: [
    "Stationary subject detected for extended duration exceeding behavioral baseline. Micro-movement analysis shows repeated orientation changes toward secured areas, suggesting surveillance behavior.",
    "Temporal tracking shows subject has remained in zone for anomalous duration. Cross-referencing against pedestrian flow models indicates deviation from normal foot traffic patterns.",
  ],
  vehicle: [
    "Unregistered vehicle plate detected in controlled zone. License plate recognition returned no match in authorized vehicle registry. Parking duration exceeds permitted threshold.",
    "Unauthorized vehicle identified via visual classification model. Vehicle has not followed standard entry protocol. Flagged for manual review by security personnel.",
  ],
  person: [
    "Unidentified individual detected in monitored zone. Facial recognition returned no known match. Body language analysis indicates hesitation consistent with unfamiliarity with the location.",
    "Person detected moving against designated flow direction. Behavioral model flags anomalous movement pattern compared to baseline foot traffic during this time window.",
  ],
  crowd: [
    "Crowd density threshold exceeded for this zone. Headcount algorithm detected unusual aggregation of individuals outside of scheduled operational hours. Monitoring for escalation.",
    "Unusual gathering detected. Social distance analysis and density mapping indicates non-standard clustering behavior near a secured access point.",
  ],
  tamper: [
    "Camera obstruction detected via pixel-level frame differential analysis. Feed integrity compromised — physical interference with lens or housing is suspected. Adjacent cameras activated.",
    "Image quality degradation and orientation shift detected simultaneously, consistent with deliberate physical manipulation. Tampering confidence score elevated by motion blur signature at point of contact.",
  ],
  object_left: [
    "Static object detected that was not present in the baseline frame. The item has remained stationary beyond the configured dwell-time threshold. Standard unattended object protocol initiated.",
    "Unattended package detected via object persistence algorithm. No individual has claimed or interacted with the object within the monitoring window. Area flagged for physical inspection.",
  ],
};

const CAMERA_IDS = [1, 2, 3, 4, 5, 6];
const ZONES = ["Main Entrance", "Parking Zone", "Server Room", "Loading Bay", "Reception", "Emergency Exit"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function simulateEvent() {
  try {
    const cameras = await db.select().from(camerasTable).where(eq(camerasTable.status, "online"));
    if (cameras.length === 0) return;

    const camera = randomItem(cameras);
    const eventType = randomItem([...EVENT_TYPES]);
    const riskScore = randomInt(
      eventType === "intrusion" || eventType === "tamper" ? 60 : 20,
      eventType === "intrusion" || eventType === "tamper" ? 98 : 75
    );
    const confidence = parseFloat((0.7 + Math.random() * 0.28).toFixed(2));
    const zone = randomItem(ZONES);
    const explanations = AI_EXPLANATIONS[eventType] ?? [];
    const aiExplanation = randomItem(explanations);

    const [event] = await db.insert(eventsTable).values({
      cameraId: camera.id,
      eventType,
      confidence,
      riskScore,
      zone,
      aiExplanation,
      timestamp: new Date(),
      status: "new",
      externalId: null,
      snapshotUrl: null,
      videoClipUrl: null,
    }).returning();

    const payload = {
      ...event,
      cameraName: camera.name,
      cameraLocation: camera.location,
      timestamp: event.timestamp.toISOString(),
      createdAt: event.createdAt?.toISOString() ?? null,
      updatedAt: event.updatedAt?.toISOString() ?? null,
    };

    eventBus.emit("live", { type: "new_event", payload });

    if (riskScore >= 70) {
      const [alert] = await db.insert(alertsTable).values({
        eventId: event.id,
        channel: "in_app",
        status: "sent",
        message: `${riskScore >= 85 ? "CRITICAL" : "HIGH"}: ${eventType.replace("_", " ")} detected at ${camera.name} (Risk: ${riskScore}/100)`,
        recipient: null,
        sentAt: new Date(),
      }).returning();

      eventBus.emit("live", {
        type: "new_alert",
        payload: {
          ...alert,
          sentAt: alert.sentAt?.toISOString() ?? null,
          createdAt: alert.createdAt?.toISOString() ?? null,
        },
      });
    }

    await db.update(camerasTable).set({ lastSeenAt: new Date() }).where(eq(camerasTable.id, camera.id));

    logger.info({ eventType, riskScore, cameraId: camera.id }, "Simulated event generated");
  } catch (err) {
    logger.error({ err }, "Simulator error");
  }
}

let simulatorInterval: ReturnType<typeof setInterval> | null = null;

export function startSimulator() {
  if (simulatorInterval) return;
  const intervalMs = randomInt(8000, 15000);
  simulatorInterval = setInterval(() => {
    void simulateEvent();
    if (simulatorInterval) {
      clearInterval(simulatorInterval);
      simulatorInterval = null;
      startSimulator();
    }
  }, intervalMs);
  logger.info({ intervalMs }, "Event simulator started");
}

export function stopSimulator() {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
}
