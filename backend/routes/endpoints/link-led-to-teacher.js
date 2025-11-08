export default async function linkLedToTeacher(req, res) {
  const { ledUq, teacherId } = req.body;

  if (!ledUq || !teacherId) {
    return res.status(400).json({
      code: "MISSING_LED_UQ_OR_TEACHER_ID",
    });
  }

  try {
    const checkLED = await prisma.enokiPhysicalLED.findUnique({
      where: {
        ledUq,
      },
    });

    if (!checkLED) {
      return res.status(404).json({
        code: "LED_NOT_FOUND",
      });
    }

    const checkTeacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
    });

    if (!checkTeacher) {
      return res.status(404).json({
        code: "TEACHER_NOT_FOUND",
      });
    }

    await prisma.enokiPhysicalLED.update({
      where: {
        ledUq,
      },
      data: {
        teacherId,
      },
    });

    return res.sendStatus(200);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
