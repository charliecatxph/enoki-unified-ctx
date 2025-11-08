import { socketsConnected } from "../../index.js";
import sendPushNotification from "../../lib/expoSend.js";
import { prisma } from "../../lib/prisma.js";
import { emitToAll, emitToSocket } from "../../lib/socket.js";

export default async function sendMessage(req, res) {
  const { studentId, message, recipientId } = req.body;

  if (!studentId || !message || !recipientId) {
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
        message: message.trim(),
        institutionId: student.enokiAcct.institutionId,
        callType: "MESSAGE",
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

    const socketId = socketsConnected.get(teacher.enokiAcct.id);
    if (socketId) {
      emitToSocket(socketId, "sig", { type: "MESSAGE-SENT" });
      console.log("EMISSION COMPLETE");
    }
    emitToAll("sig", { type: "DSH-MESSAGE" });

    if (teacher.pushNotificationToken) {
      await sendPushNotification(
        teacher.pushNotificationToken,
        `${student.enokiAcct.name} sent you a message`,
        message.trim(),
        "default"
      );
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
