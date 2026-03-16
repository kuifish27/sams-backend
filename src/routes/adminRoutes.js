const router = require("express").Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.get("/me", authMiddleware, adminController.getMe);
router.put("/me", authMiddleware, adminController.updateProfile);

module.exports = router;



