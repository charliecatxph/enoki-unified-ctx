import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { id } = req.body;
  if (!id.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    const studentAcct = await prisma.enokiAcct.findUnique({
      where: {
        studentId: id,
      },
    });
    await prisma.student.delete({
      where: { id },
    });
    await prisma.enokiAcct.delete({
      where: { id: studentAcct.id },
    });
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
