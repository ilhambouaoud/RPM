const sessionState = require("../state/sessionState");
const ModeNormale = require("../models/ModeNormale");
const ModeBalayage = require("../models/ModeBalayage");
const CalibrationService = require("../service/calibrationService");
const mqtt = require("mqtt");

/* ================= MQTT CONNECTION ================= */

const client = mqtt.connect(
  "mqtts://d0890c1a545842238a2e47b056fb4018.s1.eu.hivemq.cloud",
  {
    port: 8883,
    username: "ilham",
    password: "Bouaoud33",
    rejectUnauthorized: false
  }
);

/* ================= MQTT EVENTS ================= */

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

/* ================= PUBLISH FUNCTION ================= */

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

/* ================= INIT MQTT ================= */

function initMQTT(io) {
  console.log("✅ MQTT INIT OK");

  client.on("message", async (topic, message) => {
    const raw = message.toString();
    console.log("📩 MQTT RAW:", raw);

    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.log("⚠️ Not JSON, ignored");
      return;
    }

    /* ================= MODE NORMAL ================= */
    if (
      (parsed.type === "CPS" || parsed.type === "CPM") &&
      sessionState.currentModeNormalId
    ) {
      await ModeNormale.findByIdAndUpdate(
        sessionState.currentModeNormalId,
        {
          $push: {
            mesures: {
              value: Number(parsed.value),
              timestamp: new Date()
            }
          }
        }
      );
      console.log("✅ Mesure sauvegardée :", parsed.value);
    }

    /* ================= MODE BALAYAGE (SCAN) ================= */
    if (parsed.type === "SCAN" && sessionState.currentModeBalayageId) {
      const values = parsed.raw.split(",");
      // Format attendu: #LLD,HLD,CPS
      const tension = Number(values[1]); // LLD = tension
      const cps = Number(values[2]);     // CPS

      let energy = 0;
      try {
        energy = await CalibrationService.convertAmplitudeToEnergy(tension);
      } catch (err) {
        console.log("⚠️ Calibration non trouvée → energy = 0");
      }

      console.log(`📊 SCAN - Tension: ${tension}V, CPS: ${cps}, Energy: ${energy}keV`);

      await ModeBalayage.findByIdAndUpdate(
        sessionState.currentModeBalayageId,
        {
          $push: {
            points: {
              tension: tension,
              cps: cps,
              energy: energy,
              timestamp: new Date()
            }
          }
        }
      );

      // Envoyer au frontend avec toutes les données
      io.emit("mqttData", {
        type: "scan",
        tension: tension,
        cps: cps,
        energy: energy,
        raw: parsed.raw
      });
    } else {
      // Pour les autres types de messages (CPS, CPM, etc.)
      io.emit("mqttData", parsed);
    }
  });
}

module.exports = {
  client,
  publishMessage,
  initMQTT
};