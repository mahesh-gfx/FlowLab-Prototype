import { Router } from "express";
import { executeNode } from "../controller/nodeController";

const router = Router();

router.post("/:id/execute", executeNode);

export default router;
