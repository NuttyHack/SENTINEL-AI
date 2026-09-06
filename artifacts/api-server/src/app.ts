import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. API endpoints
app.use("/api", router);

// 2. Serve static frontend files
const frontendDist = path.resolve(process.cwd(), "artifacts/sentinel-ai/dist");
app.use(express.static(frontendDist));

// 3. Express 5 / path-to-regexp v8 catch-all wildcard syntax
app.get("/*splat", (_req, res) => {
  res.sendFile(path.resolve(frontendDist, "index.html"));
});

export default app;