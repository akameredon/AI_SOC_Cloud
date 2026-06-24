import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, alertsTable } from "@workspace/db";
import {
  GetAlertParams,
  GetAlertResponse,
  UpdateAlertParams,
  UpdateAlertBody,
  UpdateAlertResponse,
  ListAlertsQueryParams,
  ListAlertsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  const query = ListAlertsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { status, limit } = query.data;
  const conditions = [];
  if (status != null) conditions.push(eq(alertsTable.status, status));

  const alerts = await db
    .select()
    .from(alertsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(alertsTable.createdAt))
    .limit(limit ?? 50);

  res.json(ListAlertsResponse.parse(alerts));
});

router.get("/alerts/:id", async (req, res): Promise<void> => {
  const params = GetAlertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [alert] = await db.select().from(alertsTable).where(eq(alertsTable.id, params.data.id));
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(GetAlertResponse.parse(alert));
});

router.patch("/alerts/:id", async (req, res): Promise<void> => {
  const params = UpdateAlertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status === "acknowledged") {
    updateData.acknowledgedAt = new Date();
  }
  const [alert] = await db
    .update(alertsTable)
    .set(updateData)
    .where(eq(alertsTable.id, params.data.id))
    .returning();
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(UpdateAlertResponse.parse(alert));
});

export default router;
