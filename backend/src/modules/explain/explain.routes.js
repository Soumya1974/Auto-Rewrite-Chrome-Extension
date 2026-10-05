import { Router } from "express";
import { explain } from "./explain.controller.js";

const router = Router();
router.post("/", explain);

export default router;
