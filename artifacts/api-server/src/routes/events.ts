import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, eventsTable, camerasTable } from "@workspace/db";
import {
  IngestEventBody,
  GetEventParams,
  GetEventResponse,
  UpdateEventParams,
  UpdateEventBody,
  UpdateEventResponse,
  ListEventsQueryParams,
  ListEventsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const query = ListEventsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { cameraId, eventType, status, limit } = query.data;

  const conditions = [];
  if (cameraId != null) conditions.push(eq(eventsTable.cameraId, cameraId));
  if (eventType != null) conditions.push(eq(eventsTable.eventType, eventType));
  if (status != null) conditions.push(eq(eventsTable.status, status));

  const events = await db
    .select({
      id: eventsTable.id,
      externalId: eventsTable.externalId,
      cameraId: eventsTable.cameraId,
      cameraName: camerasTable.name,
      cameraLocation: camerasTable.location,
      eventType: eventsTable.eventType,
      status: eventsTable.status,
      confidence: eventsTable.confidence,
      riskScore: eventsTable.riskScore,
      zone: eventsTable.zone,
      snapshotUrl: eventsTable.snapshotUrl,
      videoClipUrl: eventsTable.videoClipUrl,
      aiExplanation: eventsTable.aiExplanation,
      timestamp: eventsTable.timestamp,
      createdAt: eventsTable.createdAt,
    })
    .from(eventsTable)
    .leftJoin(camerasTable, eq(eventsTable.cameraId, camerasTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(eventsTable.timestamp))
    .limit(limit ?? 50);

  res.json(ListEventsResponse.parse(events));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = IngestEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db.insert(eventsTable).values({
    externalId: parsed.data.externalId ?? null,
    cameraId: parsed.data.cameraId,
    eventType: parsed.data.eventType,
    confidence: parsed.data.confidence,
    riskScore: parsed.data.riskScore,
    zone: parsed.data.zone ?? null,
    snapshotUrl: parsed.data.snapshotUrl ?? null,
    videoClipUrl: parsed.data.videoClipUrl ?? null,
    aiExplanation: parsed.data.aiExplanation ?? null,
    timestamp: new Date(parsed.data.timestamp),
    status: "new",
  }).returning();
  res.status(201).json(GetEventResponse.parse({ ...event, cameraName: null, cameraLocation: null }));
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const params = GetEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db
    .select({
      id: eventsTable.id,
      externalId: eventsTable.externalId,
      cameraId: eventsTable.cameraId,
      cameraName: camerasTable.name,
      cameraLocation: camerasTable.location,
      eventType: eventsTable.eventType,
      status: eventsTable.status,
      confidence: eventsTable.confidence,
      riskScore: eventsTable.riskScore,
      zone: eventsTable.zone,
      snapshotUrl: eventsTable.snapshotUrl,
      videoClipUrl: eventsTable.videoClipUrl,
      aiExplanation: eventsTable.aiExplanation,
      timestamp: eventsTable.timestamp,
      createdAt: eventsTable.createdAt,
    })
    .from(eventsTable)
    .leftJoin(camerasTable, eq(eventsTable.cameraId, camerasTable.id))
    .where(eq(eventsTable.id, params.data.id));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(GetEventResponse.parse(event));
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db
    .update(eventsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(eventsTable.id, params.data.id))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(UpdateEventResponse.parse({ ...event, cameraName: null, cameraLocation: null }));
});

export default router;
