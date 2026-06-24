import { Router, type IRouter, type Request, type Response } from "express";
import { eventBus, type LiveEvent } from "../lib/eventBus";

const router: IRouter = Router();

router.get("/stream", (req: Request, res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write("data: {\"type\":\"connected\"}\n\n");

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 20000);

  const onLive = (event: LiveEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  eventBus.on("live", onLive);

  req.on("close", () => {
    clearInterval(heartbeat);
    eventBus.off("live", onLive);
  });
});

export default router;
