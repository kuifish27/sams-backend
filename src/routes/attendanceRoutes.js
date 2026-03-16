const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const attendanceController = require("../controllers/attendanceController");

router.post("/", authMiddleware, attendanceController.markAttendance);
router.get("/", authMiddleware, attendanceController.getAttendance);

module.exports = router;