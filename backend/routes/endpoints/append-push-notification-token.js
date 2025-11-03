import { Expo } from "expo-server-sdk";
import { prisma } from "../../lib/prisma.js";

export default async function appendPushNotificationToken(req, res) {
  const { token, teacherId } = req.body;

  if (!teacherId || !token) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({
      code: "INVALID_TOKEN",
    });
  }

  try {
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!teacher) {
      return res.status(400).json({
        code: "TEACHER_NOT_FOUND",
      });
    }
    await prisma.teacher.update({
      where: {
        id: teacherId,
      },
      data: {
        pushNotificationToken: token,
      },
    });
    console.log("OK");
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
