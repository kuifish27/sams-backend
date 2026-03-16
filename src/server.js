require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authMiddleware = require("./middleware/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const courseRoutes = require("./routes/courseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted", adminId: req.adminId });
});

app.get("/", (req, res) => {
  res.send("SAMS Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});