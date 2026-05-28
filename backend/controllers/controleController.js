const { publishMessage } = require("../mqtt/mqttClient");
const { client } = require("../mqtt/mqttClient");
const HT_DEFAULT = 2000

exports.sendTrame = (req, res) => {

  console.log("🔥 API sendTrame appelée");

  try {
    const {
      mode,   // 🔥 nouveau
      CP,
      LLD,
      HLD,
      HT,
      B,
      A,
      dV,     // 🔥 nouveau
      Vmax    // 🔥 nouveau
    } = req.body;

    // 🔍 Vérification MODE
    if (mode === undefined) {
      return res.status(400).json({
        error: "❌ mode manquant"
      });
    }

    let trame = "";

    // ================= MODE 0 : NORMAL =================
    if (mode === 0) {

      if (
        CP === undefined ||
        LLD === undefined ||
        HLD === undefined ||
        B === undefined ||
        A === undefined
      ) {
        return res.status(400).json({
          error: "❌ Données manquantes pour mode normal"
        });
      }

      trame = `#${mode},${CP},${LLD},${HLD},${HT ?? HT_DEFAULT},${B},${A}$`;
    }

    // ================= MODE 1 : SPECTRUM =================
    else if (mode === 1) {

      if (
        LLD === undefined ||
        dV === undefined ||
        Vmax === undefined ||
        B === undefined ||
        A === undefined
      ) {
        return res.status(400).json({
          error: "❌ Données manquantes pour mode spectrum"
        });
      }

      trame = `#${mode},${LLD},${dV},${Vmax},${B},${A}$`;
    }

    // ================= MODE INVALIDE =================
    else {
      return res.status(400).json({
        error: "❌ mode invalide"
      });
    }

    console.log("📤 TRAME:", trame);
    console.log("🔍 MQTT connected =", client.connected);

    if (!client.connected) {
      return res.status(500).json({
        error: "❌ MQTT non connecté"
      });
    }

    // ✅ Envoi MQTT
    client.publish("stm32/trame", trame, {}, (err) => {
      if (err) {
        console.log("❌ Publish error:", err);
        return res.status(500).json({
          error: "Erreur publish MQTT"
        });
      }

      console.log("✅ Publish OK");

      res.json({
        success: true,
        trame: trame
      });
    });

  } catch (error) {
    console.error("❌ Erreur sendTrame:", error);

    res.status(500).json({
      error: "Erreur serveur"
    });
  }
};


// ================= AUTRES ROUTES =================

exports.sendMQTTCommand = (req, res) => {
  res.send("MQTT command envoyé");
};

exports.getLastControl = (req, res) => {
  res.send("Dernier contrôle OK");
};

exports.updateBarriere = (req, res) => {
  res.send("Barrière mise à jour");
};