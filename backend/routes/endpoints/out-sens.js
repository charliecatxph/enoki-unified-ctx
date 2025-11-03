import moment from "moment";
import { prisma } from "../../lib/prisma.js";
import { emitToAll, emitToSocket } from "../../lib/socket.js";
import { socketsConnected } from "../../index.js";

export default async function outSens(req, res) {
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

    const socketId = socketsConnected.get(teacher.enokiAcct.id);

    const __todayIdx = (moment().isoWeekday() - 1) % 7;
    const currentSchedule = teacher.schedule[__todayIdx];

    if (currentSchedule.dayOff) {
      await prisma.teacherStatistics.update({
        where: {
          teacherId: teacher.id,
        },
        data: {
          status: "OUT",
        },
      });
      if (socketId) {
        emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
      }
      emitToAll("sig", { type: "STATUS-CHANGE", data: null });
      console.log("SET TO OUT");
      return res.sendStatus(200);
    }

    console.log(currentSchedule);

    for (const classTime of currentSchedule.classTimes) {
      console.log(classTime);
      if (
        moment().isBetween(
          moment().startOf("day").add(classTime.cS, "seconds"),
          moment().startOf("day").add(classTime.cE, "seconds")
        )
      ) {
        await prisma.teacherStatistics.update({
          where: {
            teacherId: teacher.id,
          },
          data: {
            status: "IN_CLASS",
          },
        });
        console.log("SET TO IN_CLASS");
        if (socketId) {
          emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
        }
        emitToAll("sig", { type: "STATUS-CHANGE", data: null });
        return res.sendStatus(200); // immediately exit if in class
      }
    }

    // If no class matched
    await prisma.teacherStatistics.update({
      where: {
        teacherId: teacher.id,
      },
      data: {
        status: "OUT",
      },
    });
    if (socketId) {
      emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
    }
    emitToAll("sig", { type: "STATUS-CHANGE", data: null });
    console.log("SET TO OUT");
    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
