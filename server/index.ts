import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import routes from "./routes";
import { seed } from "./seed";

const app = express();
const MemStore = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "fitquest-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
},
  store: new MemStore({ checkPeriod: 86400000 }),
}));

app.use("/api", routes);

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist", "public");
  console.log("Static path:", distPath);
  app.use(express.static(distPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = Number(process.env.PORT) || 5000;

async function main() {
  try {
    await seed();
    console.log("✅ Database seeded");
  } catch (e) {
    console.error("Seed error (non-fatal):", e);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚔️  FitQuest running on http://0.0.0.0:${PORT}`);
  });
}

main();
