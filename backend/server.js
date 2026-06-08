require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");

// 🔥 MQTT
const { initMQTT } = require("./mqtt/mqttClient");

const app = express();
const server = http.createServer(app);

// 🔥 SOCKET.IO
const io = socketIo(server, {
  cors: { origin: "*" }
});

/* ------------------ CORS ------------------ */

app.use(cors({
  origin: "http://localhost:5000",
  credentials: true
}));

/* ------------------ BODY PARSER ------------------ */

app.use(express.json());

/* ------------------ SESSION ------------------ */

app.use(session({
  secret: "rpm_secret_key",
  resave: false,
  saveUninitialized: false,

  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

/* ------------------ MongoDB ------------------ */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.log(err));

/* ------------------ MQTT INIT ------------------ */

initMQTT(io);

/* ------------------ Routes ------------------ */

app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/mesureRoutes"));
app.use("/api", require("./routes/controleRoutes"));
app.use("/api", require("./routes/portiqueRoutes"));
app.use("/api", require("./routes/reportRoutes"));
app.use("/api", require("./routes/testRoutes"));
app.use("/api/calibration", require("./routes/calibrationRoutes"));
app.use("/api/users",require("./routes/userRoutes"));

/* ------------------ Start Server ------------------ */

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});