const sessionState = require("../state/sessionState");
const ModeNormale = require("../models/ModeNormale");
const ModeBalayage = require("../models/ModeBalayage");
const mqtt = require("mqtt");

const { encrypt } =require("../utils/crypto");


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

  client.on("message", async (topic, message) => {

    const raw = message.toString();
    console.log("📩 MQTT RAW:", raw);

    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.log("⚠️ Not JSON, fallback parsing");
      return;
    }

    // ================= MODE NORMAL =================
if (
  parsed.type === "CPS"
  &&
  sessionState.currentModeNormalId
) {

  await ModeNormale.findByIdAndUpdate(
    sessionState.currentModeNormalId,
    {
      $push: {
        mesures: {
          value: encrypt(parsed.value)
        }
      }
    }
  );

}

    if (
  parsed.type === "CPM"
  &&
  sessionState.currentModeNormalId
) {

  const now = Date.now();

  if (
    !sessionState.lastCPMTime ||
    now - sessionState.lastCPMTime >= 60000
  ) {

    await ModeNormale.findByIdAndUpdate(
      sessionState.currentModeNormalId,
      {
        $push: {
          mesures: {
            value: encrypt(parsed.value)
          }
        }
      }
    );

    sessionState.lastCPMTime = now;

    console.log(
      "✅ CPM sauvegardé (1 minute)",
      parsed.value
    );
  }
}

    // ================= MODE BALAYAGE =================

if (
  parsed.type === "SCAN"
  &&
  sessionState.currentModeBalayageId
) {

  const values = parsed.raw.split(",");

  const tension = Number(values[1]);
  const cps = Number(values[2]);

  await ModeBalayage.findByIdAndUpdate(
    sessionState.currentModeBalayageId,
    {
      $push: {
        points: {
          tension,
          cps: encrypt(cps)
        }
      }
    }
  );

  console.log(
    "✅ Point balayage sauvegardé :",
    tension,
    cps
  );
}

    // ================= ENVOI DASHBOARD =================

    io.emit("mqttData", parsed);

  });

}

module.exports = {
  client,
  publishMessage,
  initMQTT
};