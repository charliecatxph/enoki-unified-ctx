import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { institutionId } = req.query;
  if (!institutionId.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }

  try {

    const students = await prisma.enokiAcct.findMany({
      where: {
        institutionId,
        actType: "STUDENT",
      },
      include: {
        student: {
          include: {
            course: true,
          }
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    const fx = students.map(student => {
      return {
        acctId: student.id,
        id: student.studentId,
        name: student.name,
        email: student.email,
        actType: student.actType,
        institutionId: student.institutionId,
        updatedAt: student.updatedAt,
        createdAt: student.createdAt,
        studentId: student.student.studentId,
        studentRfidHash: student.student.studentRfidHash,
        course: student.student.course,
      }
    })

    res.json({ success: true, data: fx });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
