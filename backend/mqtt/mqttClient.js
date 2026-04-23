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

client.on("connect", () => {
  console.log("✅ MQTT CONNECTÉ");
});

client.on("error", (err) => {
  console.log("❌ MQTT ERROR:", err.message);
});

client.on("reconnect", () => {
  console.log("🔁 MQTT RECONNECT...");
});

// 🔥 Fonction publish fiable
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

// 🔥 TEST AUTOMATIQUE (à garder pour debug)
setInterval(() => {
  client.publish("test/topic", "HELLO_FROM_BACKEND");
}, 5000);

function initMQTT(io) {
  console.log("MQTT INIT OK");
}

module.exports = { client, publishMessage, initMQTT };