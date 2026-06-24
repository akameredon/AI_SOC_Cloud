import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zonesTable = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cameraId: integer("camera_id").notNull(),
  type: text("type").notNull().default("monitored"),
  coordinates: text("coordinates"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertZoneSchema = createInsertSchema(zonesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertZone = z.infer<typeof insertZoneSchema>;
export type Zone = typeof zonesTable.$inferSelect;
