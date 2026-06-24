import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, alertRulesTable } from "@workspace/db";
import {
  CreateAlertRuleBody,
  UpdateAlertRuleParams,
  UpdateAlertRuleBody,
  UpdateAlertRuleResponse,
  DeleteAlertRuleParams,
  ListAlertRulesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/alert-rules", async (_req, res): Promise<void> => {
  const rules = await db.select().from(alertRulesTable).orderBy(alertRulesTable.createdAt);
  res.json(ListAlertRulesResponse.parse(rules));
});

router.post("/alert-rules", async (req, res): Promise<void> => {
  const parsed = CreateAlertRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [rule] = await db.insert(alertRulesTable).values({
    name: parsed.data.name,
    eventType: parsed.data.eventType,
    minRiskScore: parsed.data.minRiskScore ?? 0,
    channels: parsed.data.channels,
    delaySeconds: parsed.data.delaySeconds ?? 0,
    active: parsed.data.active ?? true,
  }).returning();
  res.status(201).json(rule);
});

router.patch("/alert-rules/:id", async (req, res): Promise<void> => {
  const params = UpdateAlertRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAlertRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [rule] = await db
    .update(alertRulesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(alertRulesTable.id, params.data.id))
    .returning();
  if (!rule) {
    res.status(404).json({ error: "Alert rule not found" });
    return;
  }
  res.json(UpdateAlertRuleResponse.parse(rule));
});

router.delete("/alert-rules/:id", async (req, res): Promise<void> => {
  const params = DeleteAlertRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [rule] = await db.delete(alertRulesTable).where(eq(alertRulesTable.id, params.data.id)).returning();
  if (!rule) {
    res.status(404).json({ error: "Alert rule not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
