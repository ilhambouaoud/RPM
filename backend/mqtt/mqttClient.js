const mqtt = require("mqtt");

// 🔥 Connexion HiveMQ Cloud
const client = mqtt.connect(
  "mqtts://d0890c1a545842238a2e47b056fb4018.s1.eu.hivemq.cloud",
  {
    port: 8883,
    username: "ilham",
    password: "Bouaoud33",
    rejectUnauthorized: false
  }
);

/* ------------------ MQTT EVENTS ------------------ */

client.on("connect", () => {

  console.log("✅ MQTT CONNECTÉ");

  // 🔥 Abonnement au topic
  client.subscribe("stm32/data", (err) => {
  if (err) {
    console.log("❌ Subscribe error:", err.message);
  } else {
    console.log("✅ Subscribe OK : stm32/data");
  }
});

});

client.on("error", (err) => {
  console.log("❌ MQTT ERROR:", err.message);
});

client.on("reconnect", () => {
  console.log("🔁 MQTT RECONNECT...");
});

/* ------------------ PUBLISH ------------------ */

function publishMessage(topic, message) {

  console.log("📤 PUB =>", topic, message);

  client.publish(topic, message, { qos: 1 }, (err) => {

    if (err) {
      console.log("❌ Publish error:", err.message);
    } else {
      console.log("✅ Publish OK");
    }

  });

}

/* ------------------ INIT MQTT ------------------ */

function initMQTT(io) {

  console.log("✅ MQTT INIT OK");

  // 🔥 Réception des messages
client.on("message", (topic, message) => {

  const raw = message.toString();
  console.log("📩 MQTT RAW:", raw);

  let parsed = {};

  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // si ce n'est pas JSON → on essaie de parser manuellement
    console.log("⚠️ Not JSON, fallback parsing");

    if (raw.includes("cps")) {
      const value = raw.match(/\d+/);
      parsed = { cps: value ? Number(value[0]) : 0 };
    }
  }

  io.emit("mqttData", parsed);
});

}

module.exports = {
  client,
  publishMessage,
  initMQTT
};