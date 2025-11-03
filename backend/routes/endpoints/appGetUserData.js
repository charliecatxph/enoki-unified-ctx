import { prisma } from "../../lib/prisma.js";

export default async function appGetUserData(req, res) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }

  try {
    const user = await prisma.enokiAcct.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        teacherId: true,
        institution: true,
        teacher: {
          include: {
            department: true,
            statistics: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.teacherId) {
      return res.status(400).json({
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      data: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
