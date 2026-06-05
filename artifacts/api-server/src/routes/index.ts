import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coupleRouter from "./couple";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/couple", coupleRouter);
router.use("/messages", messagesRouter);

export default router;
