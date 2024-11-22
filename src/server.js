import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse incoming JSON requests

// HTTP server to attach WebSocket
const server = http.createServer(app);

// Event Schema and Model
const eventSchema = new mongoose.Schema({
  eventType: String,
  sourceAppId: String,
  dataPayload: Object,
  timestamp: { type: Date, default: Date.now },
  previousHash: String,
  currentHash: String,
});

eventSchema.pre("save", async function (next) {
  const crypto = require("crypto");
  this.previousHash =
    (await Event.findOne().sort({ _id: -1 }))?.currentHash || "";
  const hashData = `${this.eventType}${this.timestamp}${this.sourceAppId}${this.dataPayload}${this.previousHash}`;
  this.currentHash = crypto.createHash("sha256").update(hashData).digest("hex");
  next();
});

const Event = mongoose.model("Event", eventSchema);

//  GET route to get all events
app.get("/events", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const events = await Event.find().skip(skip).limit(Number(limit));

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST route for creating an event log
app.post("/events", async (req, res) => {
  try {
    const { eventType, sourceAppId, dataPayload } = req.body;

    // Validate required fields
    if (!eventType || !sourceAppId || !dataPayload) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create and save the event
    const newEvent = new Event({
      eventType,
      sourceAppId,
      dataPayload,
    });

    await newEvent.save();

    res
      .status(201)
      .json({ message: "Event logged successfully", event: newEvent });
  } catch (error) {
    console.error("Error logging event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/event_logs")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server }); // Attach WebSocket to the same server

wss.on("connection", (ws) => {
  console.log("client connected");
  ws.send("Connected to Event Logger!");

  // Watch MongoDB for real-time updates
  const changeStream = Event.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      ws.send(JSON.stringify(change.fullDocument));
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    changeStream.close(); // Clean up
  });
});

// Broadcast to all connected clients
function broadcastEvent(event) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
}
