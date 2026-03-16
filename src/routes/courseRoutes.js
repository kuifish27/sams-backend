const router = require("express").Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

// PROTECTED ROUTES 🔐
router.post("/", authMiddleware, courseController.createCourse);
router.get("/", authMiddleware, courseController.getCourses);

module.exports = router;
