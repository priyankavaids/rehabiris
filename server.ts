import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database
const db = new Database("rehabiris.db");

// Create Progress_History table
db.exec(`
  CREATE TABLE IF NOT EXISTS Progress_History (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise TEXT NOT NULL,
    reps INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    date TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "RehabIris Server is running" });
  });

  // Mock data for rehab centers
  app.get("/api/rehab-centers", (req, res) => {
    res.json([
      { id: 1, name: "City Physiotherapy Center", lat: 13.0827, lng: 80.2707, address: "Chennai, TN", phone: "+91 98765 43210" },
      { id: 2, name: "Elite Rehab Clinic", lat: 13.0405, lng: 80.2337, address: "T. Nagar, Chennai", phone: "+91 98765 43211" },
      { id: 3, name: "Healing Touch Rehab", lat: 12.9716, lng: 77.5946, address: "Bangalore, KA", phone: "+91 98765 43212" },
    ]);
  });

  // WhatsApp Reminder API
  app.post("/api/whatsapp/remind", (req, res) => {
    const { phoneNumber, message } = req.body;
    console.log(`[WhatsApp Mock] Sending reminder to ${phoneNumber}: ${message}`);
    
    // In a real app, you would use Twilio or another WhatsApp API provider here
    // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // client.messages.create({ from: 'whatsapp:+14155238886', body: message, to: `whatsapp:${phoneNumber}` });

    res.json({ success: true, message: "Reminder sent successfully (Mock)" });
  });

  // Progress History API
  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM Progress_History ORDER BY date DESC").all();
    res.json(history);
  });

  app.post("/api/history", (req, res) => {
    const { exercise, reps, accuracy, date } = req.body;
    const stmt = db.prepare("INSERT INTO Progress_History (exercise, reps, accuracy, date) VALUES (?, ?, ?, ?)");
    stmt.run(exercise, reps, accuracy, date);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RehabIris running at http://localhost:${PORT}`);
  });
}

startServer();
