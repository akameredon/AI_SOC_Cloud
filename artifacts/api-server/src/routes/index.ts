import { Router, type IRouter } from "express";
import healthRouter from "./health";
import camerasRouter from "./cameras";
import zonesRouter from "./zones";
import eventsRouter from "./events";
import alertsRouter from "./alerts";
import alertRulesRouter from "./alertRules";
import incidentsRouter from "./incidents";
import dashboardRouter from "./dashboard";
import streamRouter from "./stream";

const router: IRouter = Router();

router.use(healthRouter);
router.use(camerasRouter);
router.use(zonesRouter);
router.use(eventsRouter);
router.use(alertsRouter);
router.use(alertRulesRouter);
router.use(incidentsRouter);
router.use(dashboardRouter);
router.use(streamRouter);

export default router;
