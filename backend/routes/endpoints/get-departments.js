import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { institutionId } = req.query;
  if (!institutionId.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }

  try {
    const departments = await prisma.department.findMany({
      where: {
        institutionId: institutionId,
      },
      include: {
        teachers: {
          include: {
            enokiAcct: {
              select: {

                name: true,
                email: true,
                actType: true,
                institutionId: true,
                createdAt: true,
                updatedAt: true,
              }
            }
          }
        },

      }
    });

    const pfx = departments.map(dept => {
      const x = dept.teachers.map(tr => {
        return {
          ...tr,
          ...tr.enokiAcct
        }
      })
      return {
        ...dept,
        teachers: x
      }
    })

    res.json({ success: true, data: pfx });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// id            String      @id @default(uuid())
// name          String
// email         String      @unique
// password      String
// actType       ACTType?
// institutionId String
// institution   Institution @relation(fields: [institutionId], references: [id])
// createdAt     DateTime    @default(now())
// updatedAt     DateTime    @updatedAt

// student   Student? @relation(fields: [studentId], references: [id])
// studentId String?  @unique

// teacher   Teacher? @relation(fields: [teacherId], references: [id])
// teacherId String?  @unique