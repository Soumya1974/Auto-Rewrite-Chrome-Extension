import "dotenv/config"; // must stay first: loads the .env file
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import rephraseRoutes from "./src/modules/rephrase/rephrase.routes.js";
import replyRoutes from "./src/modules/reply/reply.routes.js";
import explainRoutes from "./src/modules/explain/explain.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Max 20 requests per minute per IP (protects your AI credits)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    message: { error: "Too many requests. Please wait a minute." },
  })
);

app.get("/health", (_req, res) => {
  console.log("Health check request received");
  return res.json({ ok: true });
});
app.use("/api/rephrase", rephraseRoutes);
app.use("/api/reply", replyRoutes);
app.use("/api/explain", explainRoutes);



// Last-resort error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
