import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("security_events", {
  id: serial("id").primaryKey(),
  externalId: text("external_id"),
  cameraId: integer("camera_id").notNull(),
  eventType: text("event_type").notNull(),
  status: text("status").notNull().default("new"),
  confidence: real("confidence").notNull().default(0),
  riskScore: integer("risk_score").notNull().default(0),
  zone: text("zone"),
  snapshotUrl: text("snapshot_url"),
  videoClipUrl: text("video_clip_url"),
  aiExplanation: text("ai_explanation"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type SecurityEvent = typeof eventsTable.$inferSelect;
