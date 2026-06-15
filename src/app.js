const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running Successfully",
  });
});

app.use("/api/auth", require("./routers/authRoutes"));
app.use("/api/admin", require("./routers/adminRoutes"));
app.use("/api/gallery", require("./routers/galleryRoutes"));
app.use("/api/info", require("./routers/infoRoutes"));
app.use("/api/contact",require("./routers/contactRoutes"));
module.exports = app;