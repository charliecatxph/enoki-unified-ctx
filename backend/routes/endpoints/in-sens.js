import { socketsConnected } from "../../index.js";
import { prisma } from "../../lib/prisma.js";
import { emitToAll, emitToSocket } from "../../lib/socket.js";

export default async function inSens(req, res) {
  const { employeeRfidHash } = req.body;

  if (!employeeRfidHash) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }

  try {
    const teacher = await prisma.teacher.findFirst({
      where: {
        employeeRfidHash,
      },
      include: {
        enokiAcct: true,
      },
    });

    if (!teacher) {
      return res.status(400).json({
        code: "TEACHER_NOT_FOUND",
      });
    }

    await prisma.teacherStatistics.update({
      where: {
        teacherId: teacher.id,
      },
      data: {
        status: "AVAILABLE",
      },
    });
    const socketId = socketsConnected.get(teacher.enokiAcct.id);
    if (socketId) {
      emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
    }
    emitToAll("sig", { type: "STATUS-CHANGE", data: null });
    console.log("SET TO AVAIL");

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
