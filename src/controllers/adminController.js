const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/adminValidator");




// ✅ REGISTER ADMIN
exports.registerAdmin = async (req, res) => {
  try {
    // 🔐 Validate first
    const validatedData = registerSchema.parse(req.body);
    const { email, password } = validatedData;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({
        error: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "Admin registered successfully",
      adminId: admin.id,
    });

  } catch (error) {
    return res.status(400).json({
      error: error.errors || error.message,
    });
  }
};



// ✅ LOGIN ADMIN
exports.loginAdmin = async (req, res) => {
  try {
    // 🔐 Validate first
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      admin.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    return res.status(400).json({
      error: error.errors || error.message,
    });
  }
  return res.status(400).json({ error: error.message});
};

exports.registerAdmin = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name } = validatedData;

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { email, password: hashedPassword, name }
    });

    res.status(201).json({ message: "Admin registered successfully", adminId: admin.id });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(400).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { id: true, email: true, name: true, role: true }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const admin = await prisma.admin.update({
      where: { id: req.adminId },
      data: { name, avatar },
      select: { id: true, email: true, name: true, avatar: true, role: true }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
