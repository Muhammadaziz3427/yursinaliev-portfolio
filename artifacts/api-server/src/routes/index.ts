import { Router, type IRouter } from "express";
import healthRouter from "./health";
import portfolioRouter from "./portfolio";
import interactionsRouter from "./interactions";
import authRouter from "./auth";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(portfolioRouter);
router.use(interactionsRouter);
router.use(authRouter);
router.use(adminRouter);

export default router;
