import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt";

export default async function onboardPassword(req, res) {
  const { userId, password } = req.body;

  if (!password || !userId) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        code: "USER_NOT_FOUND",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: userId,
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
