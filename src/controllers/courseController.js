const prisma = require("../lib/prisma");

// ✅ CREATE COURSE
exports.createCourse = async (req, res) => {
  try {
    const { name, code } = req.body; // ← add code here

    const course = await prisma.course.create({
      data: { name, code } // ← add code here
    });

    res.json(course);

  } catch (error) {
    res.status(500).json({
      error: error.message // ← show real error for debugging
    });
  }
};

// ✅ GET ALL COURSES
exports.getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany();
    res.json(courses);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};