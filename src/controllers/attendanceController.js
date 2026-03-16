const prisma = require("../lib/prisma");

// MARK ATTENDANCE
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          date: new Date(date),
        },
      },
      update: { status },
      create: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        date: new Date(date),
        status,
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ATTENDANCE (filter by course and date)
exports.getAttendance = async (req, res) => {
  try {
    const { courseId, date } = req.query;

    const attendance = await prisma.attendance.findMany({
      where: {
        courseId: parseInt(courseId),
        date: new Date(date),
      },
      include: {
        student: true,
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};