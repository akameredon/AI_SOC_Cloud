import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, incidentsTable } from "@workspace/db";
import {
  CreateIncidentBody,
  GetIncidentParams,
  GetIncidentResponse,
  UpdateIncidentParams,
  UpdateIncidentBody,
  UpdateIncidentResponse,
  ListIncidentsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/incidents", async (_req, res): Promise<void> => {
  const incidents = await db.select().from(incidentsTable).orderBy(desc(incidentsTable.createdAt));
  res.json(ListIncidentsResponse.parse(incidents));
});

router.post("/incidents", async (req, res): Promise<void> => {
  const parsed = CreateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [incident] = await db.insert(incidentsTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    severity: parsed.data.severity,
    cameraIds: parsed.data.cameraIds ?? null,
    status: "open",
    eventCount: 0,
    aiSummary: null,
  }).returning();
  res.status(201).json(GetIncidentResponse.parse(incident));
});

router.get("/incidents/:id", async (req, res): Promise<void> => {
  const params = GetIncidentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [incident] = await db.select().from(incidentsTable).where(eq(incidentsTable.id, params.data.id));
  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }
  res.json(GetIncidentResponse.parse(incident));
});

router.patch("/incidents/:id", async (req, res): Promise<void> => {
  const params = UpdateIncidentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateIncidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status === "resolved" || parsed.data.status === "closed") {
    updateData.resolvedAt = new Date();
  }
  const [incident] = await db
    .update(incidentsTable)
    .set(updateData)
    .where(eq(incidentsTable.id, params.data.id))
    .returning();
  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }
  res.json(UpdateIncidentResponse.parse(incident));
});

export default router;
