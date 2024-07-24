import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import nodeRoutes from "./routes/node";
import workflowRoutes from "./routes/workflow";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "200mb" })); // Parse JSON request bodies
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/api/nodes", nodeRoutes);
app.use("/api/workflow", workflowRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
