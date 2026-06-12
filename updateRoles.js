const mongoose = require("mongoose");
const User = require("./src/models/User");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

async function updateRoles() {
  try {
    const result = await User.updateMany(
      {},
      { $set: { role: "user" } }
    );

    console.log(result);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateRoles();