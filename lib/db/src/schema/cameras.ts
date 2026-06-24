import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const camerasTable = pgTable("cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rtspUrl: text("rtsp_url").notNull(),
  status: text("status").notNull().default("unknown"),
  protocol: text("protocol").notNull().default("rtsp"),
  aiEnabled: boolean("ai_enabled").notNull().default(true),
  snapshotUrl: text("snapshot_url"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCameraSchema = createInsertSchema(camerasTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type Camera = typeof camerasTable.$inferSelect;
