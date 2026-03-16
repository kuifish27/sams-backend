const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../lib/prisma");

// DAILY REPORT
router.get("/daily", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
      include: { student: true, course: true },
    });

    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;

    res.json({ present, absent, late, records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TOTAL STUDENTS
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    res.json({ totalStudents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODAY'S REAL ATTENDANCE
router.get("/today", authMiddleware, async (req, res) => {
  try {
    // Get today's date in local time
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const records = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(`${dateStr}T00:00:00.000Z`),
          lte: new Date(`${dateStr}T23:59:59.999Z`),
        }
      },
      include: { student: true, course: true },
      orderBy: { createdAt: "desc" },
    });

    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;

    res.json({ present, absent, late, records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WEEKLY ATTENDANCE PER STUDENT
router.get("/weekly-students", authMiddleware, async (req, res) => {
  try {
    const students = await prisma.student.findMany({ take: 5 });
    const days = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    const result = await Promise.all(
      students.map(async (student) => {
        const weekData = await Promise.all(
          days.map(async (day) => {
            const start = new Date(day);
            const end = new Date(day);
            end.setHours(23, 59, 59);
            const record = await prisma.attendance.findFirst({
              where: { studentId: student.id, date: { gte: start, lte: end } },
            });
            return record ? record.status : null;
          })
        );
        return { name: student.name, days: weekData };
      })
    );

    res.json({ students: result, days: days.map((d) => d.toLocaleDateString("en-US", { weekday: "short" })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RECENT ACTIVITY
router.get("/activity", authMiddleware, async (req, res) => {
  try {
    const recentAttendance = await prisma.attendance.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { student: true, course: true },
    });

    const recentStudents = await prisma.student.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
    });

    res.json({ recentAttendance, recentStudents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/weekly-stats", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    
    // Go back 6 days
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    const startStr = startDate.toISOString().split("T")[0];

    const records = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(`${startStr}T00:00:00.000Z`),
          lte: new Date(`${dateStr}T23:59:59.999Z`),
        }
      }
    });

    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;

    res.json({ present, absent, late });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;