const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

// 🔥 MQTT
const { initMQTT } = require("./mqtt/mqttClient"); // adapte si chemin différent

const app = express();
const server = http.createServer(app);

// 🔥 SOCKET.IO
const io = socketIo(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

/* ------------------ MongoDB ------------------ */

mongoose.connect("mongodb://127.0.0.1:27017/RPM_Project")
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

/* ------------------ MQTT INIT 🔥 ------------------ */

initMQTT(io);   // ✅ TRÈS IMPORTANT

/* ------------------ Routes ------------------ */

app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/mesureRoutes"));
app.use("/api", require("./routes/controleRoutes"));
app.use("/api", require("./routes/portiqueRoutes"));
app.use("/api", require("./routes/reportRoutes"));
app.use("/api", require("./routes/testRoutes"));

/* ------------------ Start Server ------------------ */

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});