import express from "express";
import cors from "cors";
import workflowRoutes from "./routes/workflow";
import nodeRoutes from "./routes/node";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/workflow", workflowRoutes);
app.use("/api/node", nodeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
