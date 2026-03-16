const prisma = require("../prismaClient");
const { createStudentSchema } = require("../validators/studentValidator");
const bcrypt = require("bcrypt");


// CREATE
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const student = await prisma.student.create({
      data: { name, email, password: hashedPassword },
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// READ ALL
exports.getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// READ ONE
exports.getStudentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.json(student);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE
exports.updateStudent = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const student = await prisma.student.update({
      where: { id },
      data: req.body
    });

    res.json(student);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// DELETE
exports.deleteStudent = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Delete related records first
    await prisma.attendance.deleteMany({ where: { studentId: id } });
    await prisma.enrollment.deleteMany({ where: { studentId: id } });

    // Then delete the student
    await prisma.student.delete({ where: { id } });

    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};