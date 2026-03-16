const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const studentController = require("../controllers/studentController");
const prisma = require("../lib/prisma");

// BASIC CRUD
router.post("/", authMiddleware, studentController.createStudent);
router.get("/", authMiddleware, studentController.getAllStudents);
router.put("/:id", authMiddleware, studentController.updateStudent);
router.delete("/:id", authMiddleware, studentController.deleteStudent);

// GET STUDENTS ENROLLED IN A COURSE — must be before /:id
router.get("/enrolled/:courseId", authMiddleware, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: { student: true },
    });
    const students = enrollments.map((e) => e.student);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET STUDENT ATTENDANCE
router.get("/:id/attendance", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const attendance = await prisma.attendance.findMany({
      where: { studentId: id },
      include: { course: true },
      orderBy: { date: "desc" },
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET STUDENT ENROLLMENTS
router.get("/:id/enrollments", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: id },
      include: { course: true },
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENROLL STUDENT
router.post("/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { courseId } = req.body;

    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId: parseInt(courseId),
        },
      },
      update: {},
      create: {
        studentId,
        courseId: parseInt(courseId),
      },
    });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE STUDENT — must be after specific routes
router.get("/:id", authMiddleware, studentController.getStudentById);

const bcrypt = require("bcrypt");

// STUDENT REGISTER (set password)
router.post("/set-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const student = await prisma.student.update({
      where: { email },
      data: { password: hashed },
    });
    res.json({ message: "Password set successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STUDENT LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!student.password) return res.status(400).json({ error: "Password not set. Contact your admin." });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ studentId: student.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, student: { id: student.id, name: student.name, email: student.email, studentId: student.studentId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET STUDENT PROFILE (for mobile)
router.get("/profile/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    const token = authHeader.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await prisma.student.findUnique({
      where: { id: decoded.studentId },
      include: {
        Attendance: {
          include: { course: true },
          orderBy: { date: "desc" },
        },
        enrollments: { include: { course: true } },
      },
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;