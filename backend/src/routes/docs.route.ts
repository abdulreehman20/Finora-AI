import { Router } from "express";
import { apiReference } from "@scalar/express-api-reference";
import { openApiSpec } from "../configs/openapi.config";

const docsRouter = Router();

// Serve the raw OpenAPI JSON at /api/docs/openapi.json
docsRouter.get("/openapi.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

// Serve the interactive Scalar UI at /api/docs
docsRouter.use(
  "/",
  apiReference({
    content: openApiSpec,
    theme: "deepSpace",
    layout: "modern",
    defaultHttpClient: {
      targetKey: "js",
      clientKey: "fetch",
    },
    metaData: {
      title: "Finora AI – API Reference",
    },
  }),
);

export default docsRouter;
