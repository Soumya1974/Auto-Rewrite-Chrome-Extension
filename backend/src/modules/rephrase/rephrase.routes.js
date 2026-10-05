import { Router } from "express";
import { rephrase } from "./rephrase.controller.js";

const router = Router();
router.post("/", rephrase);

export default router;
