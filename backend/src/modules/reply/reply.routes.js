import { Router } from "express";
import { reply } from "./reply.controller.js";

const router = Router();
router.post("/", reply);

export default router;
