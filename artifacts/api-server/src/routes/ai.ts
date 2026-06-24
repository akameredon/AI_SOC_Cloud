import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { db, eventsTable, alertsTable, incidentsTable, camerasTable } from "@workspace/db";
import { desc, gte, eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

async function buildSecurityContext(): Promise<string> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [cameras, recentEvents, activeAlerts, openIncidents] = await Promise.all([
    db.select().from(camerasTable).limit(20),
    db.select({
      id: eventsTable.id,
      cameraId: eventsTable.cameraId,
      eventType: eventsTable.eventType,
      riskScore: eventsTable.riskScore,
      confidence: eventsTable.confidence,
      zone: eventsTable.zone,
      status: eventsTable.status,
      aiExplanation: eventsTable.aiExplanation,
      timestamp: eventsTable.timestamp,
    })
      .from(eventsTable)
      .where(gte(eventsTable.timestamp, since24h))
      .orderBy(desc(eventsTable.timestamp))
      .limit(30),
    db.select().from(alertsTable).where(eq(alertsTable.status, "sent")).orderBy(desc(alertsTable.createdAt)).limit(10),
    db.select().from(incidentsTable).limit(10),
  ]);

  const cameraMap = new Map(cameras.map(c => [c.id, c]));

  const camerasSummary = cameras.map(c =>
    `  - ${c.name} (ID:${c.id}) at ${c.location}: status=${c.status}, AI detection=${c.aiDetectionEnabled ? "ON" : "OFF"}`
  ).join("\n");

  const eventsSummary = recentEvents.length === 0
    ? "  No events in the last 24 hours."
    : recentEvents.map(e => {
        const cam = cameraMap.get(e.cameraId);
        return `  - [${new Date(e.timestamp).toISOString()}] ${e.eventType.toUpperCase()} | Camera: ${cam?.name ?? `CAM-${e.cameraId}`} | Zone: ${e.zone ?? "unknown"} | Risk: ${e.riskScore}/100 | Status: ${e.status}${e.aiExplanation ? ` | AI note: ${e.aiExplanation.substring(0, 120)}...` : ""}`;
      }).join("\n");

  const alertsSummary = activeAlerts.length === 0
    ? "  No active alerts."
    : activeAlerts.map(a => `  - Alert #${a.id}: ${a.message} (channel: ${a.channel})`).join("\n");

  const incidentsSummary = openIncidents.length === 0
    ? "  No open incidents."
    : openIncidents.map(i =>
        `  - Incident #${i.id}: "${i.title}" | Severity: ${i.severity} | Status: ${i.status} | Events: ${i.eventCount}`
      ).join("\n");

  return `=== AI-SOC LIVE SECURITY CONTEXT (as of ${new Date().toISOString()}) ===

CAMERAS (${cameras.length} total):
${camerasSummary}

SECURITY EVENTS — LAST 24 HOURS (${recentEvents.length} events):
${eventsSummary}

ACTIVE ALERTS (${activeAlerts.length}):
${alertsSummary}

OPEN INCIDENTS (${openIncidents.length}):
${incidentsSummary}
=== END CONTEXT ===`;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

router.post("/ai/chat", async (req, res): Promise<void> => {
  const { messages } = req.body as { messages?: ChatMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI assistant is not configured. Please add GEMINI_API_KEY to Secrets." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const ai = getClient();
    const securityContext = await buildSecurityContext();

    const systemInstruction = `You are ARIA (AI Risk Intelligence Assistant), the AI brain of AI-SOC Cloud — an enterprise-grade Security Operations Center platform.

You have real-time access to live security data from the platform. Your role is to help security operators understand what is happening across their camera network, identify threats, analyze incidents, and recommend responses.

${securityContext}

GUIDELINES:
- Always reference specific events, cameras, zones, risk scores, or incidents from the live context when answering.
- Be concise, direct, and professional — operators are busy and need actionable intelligence.
- For high-risk events (risk score ≥ 80), always highlight urgency.
- Use military-style precision: timestamps, camera IDs, zone names, risk scores.
- When asked "what happened on [camera]", filter the context to that camera's events.
- Format responses clearly — use bullet points for lists of events, bold for critical items.
- If you do not have enough data to answer accurately, say so rather than guessing.`;

    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    logger.error({ err }, "AI chat error");
    res.write(`data: ${JSON.stringify({ error: "AI assistant encountered an error. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;
