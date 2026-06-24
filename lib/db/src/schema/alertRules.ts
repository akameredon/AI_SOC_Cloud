import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertRulesTable = pgTable("alert_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  eventType: text("event_type").notNull().default("any"),
  minRiskScore: integer("min_risk_score").notNull().default(0),
  channels: text("channels").notNull().default("in_app"),
  delaySeconds: integer("delay_seconds").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAlertRuleSchema = createInsertSchema(alertRulesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;
export type AlertRule = typeof alertRulesTable.$inferSelect;
