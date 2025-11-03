import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { institutionId, departmentId } = req.query;

  if (!institutionId?.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }

  try {
    const teachers = await prisma.enokiAcct.findMany({
      where: {
        institutionId,
        actType: "TEACHER",
      },
      include: {
        teacher: {
          include: {
            statistics: true,
            department: true,
          }
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    const consolidated = teachers.map(teacher => {
      return {
        acctId: teacher.id,
        id: teacher.teacherId,
        name: teacher.name,
        email: teacher.email,
        actType: teacher.actType,
        institutionId: teacher.institutionId,
        updatedAt: teacher.updatedAt,
        createdAt: teacher.createdAt,
        schedule: teacher.teacher?.schedule,
        statistics: teacher.teacher?.statistics,
        department: teacher.teacher?.department,
        departmentId: teacher.teacher.departmentId,
        employeeRfidHash: teacher.teacher.employeeRfidHash
      }
    })

    const filtered = departmentId ? consolidated.filter(teacher => teacher.departmentId === departmentId) : consolidated;

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
