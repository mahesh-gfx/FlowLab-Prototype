require("dotenv").config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
// import helmet from "helmet";
import authRoutes from "./routes/auth";
import nodeRoutes from "./routes/node";
import workflowRoutes from "./routes/workflow";
import authService from "./services/authService";
import { setupDatabase } from "./setup";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// app.use(helmet()); // Adds various HTTP headers for security
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: "200mb" })); // Parse JSON request bodies
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(morgan("dev")); // HTTP request logger
// Middleware to protect all routes except login, logout, and register
app.use((req, res, next) => {
  const unprotectedRoutes = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/logout",
  ];
  if (unprotectedRoutes.includes(req.path)) {
    return next();
  }
  return authService.authMiddleware(req, res, next);
});

// Routes
app.use("/api/auth", authRoutes);
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

// Function to get full routes recursively
const getRoutes = (app: express.Application) => {
  const routes: string[] = [];

  const processLayer = (path: string, layer: any) => {
    if (layer.route) {
      // Route registered directly on the app
      layer.route.stack.forEach((routeLayer: any) => {
        const routePath = path + (layer.route.path || "");
        routes.push(`${routeLayer.method.toUpperCase()} ${routePath}`);
      });
    } else if (layer.name === "router" && layer.handle.stack) {
      // Router middleware
      const routerPath =
        path +
        layer.regexp.source
          .replace(/^\^/, "")
          .replace(/\\\/\?\(\?\=\\\/\|\$\)/, "")
          .replace(/\\/g, "");

      layer.handle.stack.forEach((nestedLayer: any) => {
        processLayer(routerPath, nestedLayer);
      });
    } else if (layer.name && path) {
      // Middleware without route path
      routes.push(`MIDDLEWARE ${path}`);
    }
  };

  app._router.stack.forEach((layer: any) => {
    processLayer("", layer);
  });

  return routes;
};

// List all routes
const routes = getRoutes(app);
console.log("Available routes: ");
routes.forEach((route: string, index: number) => {
  console.log(`\t ${index + 1}. ${route}`);
});

setupDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error("Could not run server: ", error.message);
  });

export default app;
