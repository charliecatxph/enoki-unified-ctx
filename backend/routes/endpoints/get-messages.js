import { prisma } from "../../lib/prisma.js";

export default async function getMessages(req, res) {
  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({
      code: "MISSING_TEACHER_ID",
    });
  }

  try {
    const messages = await prisma.callTeacher.findMany({
      where: {
        teacherId,
        isDeleted: false,
        callType: "MESSAGE",
      },
      select: {
        student: {
          select: {
            enokiAcct: {
              select: {
                name: true,
                id: true,
                email: true,
              },
            },
            course: {
              select: {
                name: true,
              },
            },
          },
        },
        message: true,
        calledAt: true,
        isRead: true,
        id: true,
      },
      orderBy: {
        calledAt: "desc",
      },
    });

    if (messages.length === 0) {
      return res.status(200).json({
        data: [],
      });
    }

    // Message consolidator: group by studentId and sort by sentAt
    const consolidatedMessages = messages.reduce((acc, message) => {
      const studentId = message.student.enokiAcct.id;

      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName: message.student.enokiAcct.name,
          studentEmail: message.student.enokiAcct.email,
          courseName: message.student.course.name,
          messages: [],
        };
      }

      acc[studentId].messages.push({
        message: message.message,
        sentAt: message.calledAt,
        isRead: message.isRead,
        id: message.id,
      });

      return acc;
    }, {});

    // Sort messages within each student group by sentAt (most recent first)
    Object.values(consolidatedMessages).forEach((studentGroup) => {
      studentGroup.messages.sort(
        (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
      );
    });

    // Convert to array and sort by most recent message per student
    const sortedConsolidatedMessages = Object.values(consolidatedMessages).sort(
      (a, b) => {
        const latestA = new Date(a.messages[0].sentAt);
        const latestB = new Date(b.messages[0].sentAt);
        return latestB - latestA;
      }
    );

    console.log(sortedConsolidatedMessages[0].messages[0]);

    return res.status(200).json({
      data: sortedConsolidatedMessages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
