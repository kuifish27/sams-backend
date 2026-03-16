const { z } =require("zod")

exports.createStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format")
})

exports.updateStudentSchema = z.object({
   name: z.string().min(2).optional(),
  email: z.string().email().optional()
});