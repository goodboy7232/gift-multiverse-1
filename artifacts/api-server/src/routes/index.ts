import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import giftCardsRouter from "./giftCards.js";
import ordersRouter from "./orders.js";
import sellRequestsRouter from "./sellRequests.js";
import dashboardRouter from "./dashboard.js";
import blogRouter from "./blog.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(giftCardsRouter);
router.use(ordersRouter);
router.use(sellRequestsRouter);
router.use(dashboardRouter);
router.use(blogRouter);
router.use(adminRouter);

export default router;
