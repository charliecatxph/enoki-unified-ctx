import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const {
    name,
    email,
    employeeRfidHash,
    institutionId,
    departmentId,
    schedule,
  } = req.body;

  if (
    !name.trim() ||
    !email.trim() ||
    !employeeRfidHash.trim() ||
    !institutionId.trim() ||
    !departmentId.trim() ||
    !JSON.stringify(schedule).trim()
  ) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }

  try {
    const checkRfid = await prisma.teacher.findFirst({
      where: {
        employeeRfidHash: employeeRfidHash.trim().toUpperCase(),
        enokiAcct: {
          institutionId: institutionId
        }
      }
    });
    if (checkRfid) {
      return res.status(400).json({ message: "Employee RFID already exists" });
    }

    const checkEmail = await prisma.enokiAcct.findUnique({
      where: {
        email: email.trim(),
        institutionId: institutionId.trim()
      }
    });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await prisma.enokiAcct.create({
      data: {
        name,
        email,
        password: "",
        actType: "TEACHER",
        institution: {
          connect: {
            id: institutionId,
          }
        },
        teacher: {
          create: {
            employeeRfidHash: employeeRfidHash.toUpperCase(),
            schedule,
            statistics: {
              create: {
                status: "OUT",
              },
            },
            department: {
              connect: {
                id: departmentId,
              },
            },
          }
        }
      }
    })
    res.json({ success: true });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, error: error.message });
  }
};
