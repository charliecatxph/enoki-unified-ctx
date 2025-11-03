import { prisma } from "../../lib/prisma.js";

export default async function notifyTeacher(req, res) {
  const { studentId, recipientId } = req.body;

  if (!studentId || !recipientId) {
    return res
      .status(400)
      .json({ success: false, error: "PARAMETERS_INCOMPLETE" });
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
      },
      include: {
        enokiAcct: true,
      },
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, error: "STUDENT_NOT_FOUND" });
    }
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: recipientId,
      },
      include: {
        enokiAcct: true,
      },
    });

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, error: "TEACHER_NOT_FOUND" });
    }
    await prisma.callTeacher.create({
      data: {
        studentId: student.id,
        teacherId: teacher.id,
        institutionId: student.enokiAcct.institutionId,
        callType: "NOTIFY",
      },
    });

    await prisma.student.update({
      where: {
        id: student.id,
      },
      data: {
        lastCall: new Date(),
      },
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
