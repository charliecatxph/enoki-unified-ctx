import { prisma } from "../../lib/prisma.js";
import { emitToAll } from "../../lib/socket.js";

export default async (req, res) => {
  const { teacherId, status, cmb = null } = req.body;
  console.log(req.body);
  if (!teacherId.trim() || !status.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!teacher) {
      return res.status(400).json({ code: "TEACHER_NOT_FOUND" });
    }

    await prisma.teacherStatistics.update({
      where: {
        teacherId,
      },
      data: {
        status,
        cmb,
        updatedAt: new Date(),
      },
    });
    console.log("OK");
    emitToAll("sig", { type: "STATUS-CHANGE", data: null });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, error: error.message });
  }
};
