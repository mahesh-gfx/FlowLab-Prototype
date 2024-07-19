import { Router } from "express";
import { runWorkflow } from "../controller/workflowController";

const router = Router();

router.post("/run", runWorkflow);

export default router;
