import express from "express";
import { nodeService } from "../services/nodeService";

const router = express.Router();

router.get("/node-definitions", (req, res) => {
  const definitions = nodeService.getNodeDefinitions();
  console.log("Node definitions: ", definitions);
  res.json(definitions);
});

export default router;
