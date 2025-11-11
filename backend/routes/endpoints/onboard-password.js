import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

export default async function onboardPassword(req, res) {
  const { teacherId, password } = req.body;

  if (!password || !teacherId) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }

  try {
    const user = await prisma.enokiAcct.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!user) {
      return res.status(404).json({
        code: "USER_NOT_FOUND",
      });
    }
    console.log("password hashed. onboarded");

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.enokiAcct.update({
      where: {
        id: teacherId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      code: "SUCCESS",
    });
  } catch (e) {
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
