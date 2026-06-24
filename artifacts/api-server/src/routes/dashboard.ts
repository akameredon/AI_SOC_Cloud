import { Router, type IRouter } from "express";
import { eq, sql, desc, and, gte } from "drizzle-orm";
import { db, camerasTable, eventsTable, alertsTable, incidentsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetEventTimelineResponse,
  GetEventBreakdownResponse,
  GetCameraHealthResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [cameras, eventsToday, activeAlerts, openIncidents] = await Promise.all([
    db.select().from(camerasTable),
    db.select({ count: sql<number>`count(*)::int` }).from(eventsTable).where(gte(eventsTable.timestamp, todayStart)),
    db.select({ count: sql<number>`count(*)::int` }).from(alertsTable).where(
      and(eq(alertsTable.status, "sent"))
    ),
    db.select({ count: sql<number>`count(*)::int` }).from(incidentsTable).where(
      and(sql`${incidentsTable.status} IN ('open', 'investigating')`)
    ),
  ]);

  const criticalEvents = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable)
    .where(and(gte(eventsTable.timestamp, todayStart), gte(eventsTable.riskScore, 80)));

  const avgRiskResult = await db
    .select({ avg: sql<number>`COALESCE(avg(risk_score), 0)::float` })
    .from(eventsTable)
    .where(gte(eventsTable.timestamp, todayStart));

  const onlineCameras = cameras.filter(c => c.status === "online").length;
  const offlineCameras = cameras.filter(c => c.status === "offline" || c.status === "error").length;

  res.json(GetDashboardSummaryResponse.parse({
    totalCameras: cameras.length,
    onlineCameras,
    offlineCameras,
    totalEventsToday: eventsToday[0]?.count ?? 0,
    activeAlerts: activeAlerts[0]?.count ?? 0,
    openIncidents: openIncidents[0]?.count ?? 0,
    criticalEvents: criticalEvents[0]?.count ?? 0,
    avgRiskScore: Math.round((avgRiskResult[0]?.avg ?? 0) * 10) / 10,
  }));
});

router.get("/dashboard/event-timeline", async (_req, res): Promise<void> => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const buckets = await db
    .select({
      hour: sql<string>`date_trunc('hour', timestamp)::text`,
      count: sql<number>`count(*)::int`,
      critical: sql<number>`count(*) filter (where risk_score >= 80)::int`,
    })
    .from(eventsTable)
    .where(gte(eventsTable.timestamp, last24h))
    .groupBy(sql`date_trunc('hour', timestamp)`)
    .orderBy(sql`date_trunc('hour', timestamp)`);

  res.json(GetEventTimelineResponse.parse(buckets));
});

router.get("/dashboard/event-breakdown", async (_req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const totals = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(eventsTable)
    .where(gte(eventsTable.timestamp, todayStart));

  const total = totals[0]?.count ?? 1;

  const breakdown = await db
    .select({
      eventType: eventsTable.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(eventsTable)
    .where(gte(eventsTable.timestamp, todayStart))
    .groupBy(eventsTable.eventType)
    .orderBy(desc(sql`count(*)`));

  const result = breakdown.map(row => ({
    eventType: row.eventType,
    count: row.count,
    percentage: Math.round((row.count / total) * 1000) / 10,
  }));

  res.json(GetEventBreakdownResponse.parse(result));
});

router.get("/dashboard/camera-health", async (_req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const cameras = await db.select().from(camerasTable);

  const eventCounts = await db
    .select({
      cameraId: eventsTable.cameraId,
      count: sql<number>`count(*)::int`,
    })
    .from(eventsTable)
    .where(gte(eventsTable.timestamp, todayStart))
    .groupBy(eventsTable.cameraId);

  const countMap = new Map(eventCounts.map(e => [e.cameraId, e.count]));

  const result = cameras.map(c => ({
    id: c.id,
    name: c.name,
    location: c.location,
    status: c.status,
    eventCount: countMap.get(c.id) ?? 0,
    lastSeenAt: c.lastSeenAt?.toISOString() ?? null,
    snapshotUrl: c.snapshotUrl ?? null,
  }));

  res.json(GetCameraHealthResponse.parse(result));
});

export default router;
