const { publishMessage } = require("../mqtt/mqttClient");

exports.sendTrame = (req, res) => {

  console.log("API sendTrame appelée");

  const CP = 10;
  const LLD = 20;
  const HLD = 30;
  const HT = 40;
  const B = 1;
  const A = 0;

  // 🔥 TRAME CORRECTE
  const trame = `#${CP},${LLD},${HLD},${HT},${B},${A}$`;

  console.log("📤 TRAME:", trame);

  // 🔥 ENVOI MQTT
  publishMessage("stm32/trame", trame);

  res.json({
    success: true,
    topic: "stm32/trame",
    trame
  });
};

exports.sendMQTTCommand = (req, res) => {
  res.send("MQTT command envoyé");
};

exports.getLastControl = (req, res) => {
  res.send("Dernier contrôle OK");
};

exports.updateBarriere = (req, res) => {
  res.send("Barrière mise à jour");
};