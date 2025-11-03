import { prisma } from "../../lib/prisma.js";

export default async function appLogout(req, res) {
  const { teacherId } = req.body;

  if (!teacherId) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }
  try {
    await prisma.teacher.update({
      where: {
        id: teacherId,
      },
      data: {
        pushNotificationToken: null,
      },
    });
    console.log("TOKEN CLEARED");
    return res.status(200).json({
      code: "SUCCESS",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
