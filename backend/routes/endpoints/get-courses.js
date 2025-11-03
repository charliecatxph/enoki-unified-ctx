import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { institutionId } = req.query;
  if (!institutionId.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        institutionId: institutionId
      },
      include: {
        students: {
          include: {
            enokiAcct: {
              select: {
                id: true,
                name: true,
                email: true,
                actType: true,
                institutionId: true,
                createdAt: true,
                updatedAt: true,
              }
            },
          }
        }
      }
    });

    const fx = courses.map(course => {
      return {
        ...course,
        students: course.students.map(student => {
          return {
            ...student,
            ...student.enokiAcct
          }
        })
      }
    })

    res.json({ success: true, data: fx });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
