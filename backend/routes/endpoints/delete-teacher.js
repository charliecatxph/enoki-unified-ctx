import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { id } = req.body;
  if (!id.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    console.log(id)
    const teacher = await prisma.enokiAcct.findUnique({
      where: {
        teacherId: id,
      }
    })

    if (!teacher) {
      throw new Error("Teacher not found")
    }

    const acctId = teacher.id;

    await prisma.teacherStatistics.delete({
      where: { teacherId: id },
    });

    await prisma.teacher.delete({
      where: { id },
    });
    await prisma.enokiAcct.delete({
      where: {
        id: acctId
      },
    });
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, error: error.message });
  }
};
