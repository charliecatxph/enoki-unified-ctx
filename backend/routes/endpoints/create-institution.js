import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt"

export default async (req, res) => {
 const { schoolName, ownerName, email, password } = req.body;
 if (!schoolName.trim() || !ownerName.trim() || !email.trim() || !password.trim()) {
  return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
 }
 try {
  const hash = await bcrypt.hash(password, 10);
  const institution = await prisma.institution.create({
   data: {
    name: schoolName.trim(),
    ownerName: ownerName.trim(),
    email: email.trim(),
    password: hash
   }
  });
  res.json({ success: true, data: institution });
 } catch (error) {
  console.log(error);
  res.status(400).json({ code: "SERVER_ERROR" });
 }
};
