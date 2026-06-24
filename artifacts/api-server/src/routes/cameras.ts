import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, camerasTable } from "@workspace/db";
import {
  CreateCameraBody,
  GetCameraParams,
  GetCameraResponse,
  UpdateCameraParams,
  UpdateCameraBody,
  UpdateCameraResponse,
  DeleteCameraParams,
  ListCamerasResponse,
  TestCameraConnectionParams,
  TestCameraConnectionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cameras", async (_req, res): Promise<void> => {
  const cameras = await db.select().from(camerasTable).orderBy(camerasTable.createdAt);
  res.json(ListCamerasResponse.parse(cameras));
});

router.post("/cameras", async (req, res): Promise<void> => {
  const parsed = CreateCameraBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [camera] = await db.insert(camerasTable).values({
    name: parsed.data.name,
    location: parsed.data.location,
    rtspUrl: parsed.data.rtspUrl,
    protocol: parsed.data.protocol ?? "rtsp",
    aiEnabled: parsed.data.aiEnabled ?? true,
    status: "unknown",
  }).returning();
  res.status(201).json(GetCameraResponse.parse(camera));
});

router.get("/cameras/:id", async (req, res): Promise<void> => {
  const params = GetCameraParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [camera] = await db.select().from(camerasTable).where(eq(camerasTable.id, params.data.id));
  if (!camera) {
    res.status(404).json({ error: "Camera not found" });
    return;
  }
  res.json(GetCameraResponse.parse(camera));
});

router.patch("/cameras/:id", async (req, res): Promise<void> => {
  const params = UpdateCameraParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCameraBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [camera] = await db
    .update(camerasTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(camerasTable.id, params.data.id))
    .returning();
  if (!camera) {
    res.status(404).json({ error: "Camera not found" });
    return;
  }
  res.json(UpdateCameraResponse.parse(camera));
});

router.delete("/cameras/:id", async (req, res): Promise<void> => {
  const params = DeleteCameraParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [camera] = await db.delete(camerasTable).where(eq(camerasTable.id, params.data.id)).returning();
  if (!camera) {
    res.status(404).json({ error: "Camera not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/cameras/:id/test", async (req, res): Promise<void> => {
  const params = TestCameraConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [camera] = await db.select().from(camerasTable).where(eq(camerasTable.id, params.data.id));
  if (!camera) {
    res.status(404).json({ error: "Camera not found" });
    return;
  }
  // Simulate connection test
  const isOnline = camera.status === "online" || Math.random() > 0.3;
  const latencyMs = isOnline ? Math.floor(Math.random() * 80) + 20 : null;
  if (isOnline) {
    await db.update(camerasTable).set({ status: "online", lastSeenAt: new Date(), updatedAt: new Date() }).where(eq(camerasTable.id, params.data.id));
  }
  res.json(TestCameraConnectionResponse.parse({
    success: isOnline,
    message: isOnline ? `Connected to ${camera.name} (${latencyMs}ms)` : `Failed to reach ${camera.rtspUrl}`,
    latencyMs,
  }));
});

export default router;
