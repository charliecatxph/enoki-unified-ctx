import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { name, email, studentId, studentRfidHash, institutionId, courseId } =
    req.body;
  if (
    !name.trim() ||
    !email.trim() ||
    !studentId.trim() ||
    !studentRfidHash.trim() ||
    !institutionId.trim() ||
    !courseId.trim()
  ) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    const checkRfid = await prisma.student.findFirst({
      where: {
        studentRfidHash: studentRfidHash.trim().toUpperCase(),
        enokiAcct: {
          institutionId: institutionId
        }
      }
    });
    if (checkRfid) {
      return res.status(400).json({ message: "Student RFID already exists" });
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
        actType: "STUDENT",
        institution: {
          connect: {
            id: institutionId,
          }
        },
        student: {
          create: {
            studentId: studentId.toUpperCase(),
            studentRfidHash: studentRfidHash.toUpperCase(),
            course: {
              connect: {
                id: courseId,
              }
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
