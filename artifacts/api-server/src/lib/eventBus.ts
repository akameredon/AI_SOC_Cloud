import { EventEmitter } from "events";

class EventBus extends EventEmitter {}

export const eventBus = new EventBus();
eventBus.setMaxListeners(100);

export type LiveEvent = {
  type: "new_event" | "new_alert" | "camera_status";
  payload: Record<string, unknown>;
};
