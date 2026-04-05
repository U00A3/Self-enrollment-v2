import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  getEligibility,
  getRegions,
  postJoin,
  postMigrate,
  postLeave,
  postAdminRevoke,
} from "./routes.js";
import { getDb } from "./db.js";

// Initialize DB and tables on startup
getDb();

const app = express();
const PORT = process.env.PORT || 3002;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "256kb" }));

app.get("/api/eligibility", getEligibility);
app.get("/api/regions", getRegions);
app.post("/api/join", postJoin);
app.post("/api/migrate", postMigrate);
app.post("/api/leave", postLeave);
app.post("/api/admin/revoke", postAdminRevoke);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "redbelly-dao-backend" });
});

app.listen(PORT, () => {
  console.log(`Redbelly DAO backend listening on port ${PORT}`);
});
