import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, zonesTable } from "@workspace/db";
import {
  CreateZoneBody,
  UpdateZoneParams,
  UpdateZoneBody,
  UpdateZoneResponse,
  DeleteZoneParams,
  ListZonesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/zones", async (_req, res): Promise<void> => {
  const zones = await db.select().from(zonesTable).orderBy(zonesTable.createdAt);
  res.json(ListZonesResponse.parse(zones));
});

router.post("/zones", async (req, res): Promise<void> => {
  const parsed = CreateZoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [zone] = await db.insert(zonesTable).values({
    name: parsed.data.name,
    cameraId: parsed.data.cameraId,
    type: parsed.data.type,
    coordinates: parsed.data.coordinates ?? null,
    active: parsed.data.active ?? true,
  }).returning();
  res.status(201).json(zone);
});

router.patch("/zones/:id", async (req, res): Promise<void> => {
  const params = UpdateZoneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateZoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [zone] = await db
    .update(zonesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(zonesTable.id, params.data.id))
    .returning();
  if (!zone) {
    res.status(404).json({ error: "Zone not found" });
    return;
  }
  res.json(UpdateZoneResponse.parse(zone));
});

router.delete("/zones/:id", async (req, res): Promise<void> => {
  const params = DeleteZoneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [zone] = await db.delete(zonesTable).where(eq(zonesTable.id, params.data.id)).returning();
  if (!zone) {
    res.status(404).json({ error: "Zone not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
