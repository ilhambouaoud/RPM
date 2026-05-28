const mongoose = require("mongoose");

async function testMongo() {
  try {

    // connexion MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/RPM_Project");

    console.log("✅ MongoDB connecté");

    // lire directement la collection Utilisateurs
    const users = await mongoose.connection.db
      .collection("Utilisateurs")
      .find({})
      .toArray();

    console.log("USERS :");
    console.log(users);

  } catch (error) {

    console.log("❌ ERREUR");
    console.log(error);

  } finally {

    await mongoose.disconnect();

  }
}

testMongo();