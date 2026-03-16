import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcrypt"
import prisma from "./Prismaclient.js";

const app = express();

app.post("/api/admin/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // SAVE ADMIN
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
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});



// ✅ Middlewares
app.use(cors());
app.use(express.json());


// ✅ Test Route
app.get("/", (req, res) => {
  res.send("SAMS Backend is running 🚀");
});


// ✅ PORT
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
