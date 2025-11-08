import { prisma } from "../../lib/prisma.js";

export default async function getEnokiLedSystem(req, res) {
  const { institutionId } = req.body;

  if (!institutionId) {
    return res.status(400).json({
      code: "MISSING_INSTITUTION_ID",
    });
  }

  try {
    const enokiLedSystem = await prisma.enokiLEDSystem.findMany({
      where: {
        institutionId,
      },
      select: {
        deviceSID: true,
        name: true,
        installedAt: true,
        institutionId: true,
        currentState: true,
        physicalLeds: {
          select: {
            ledUq: true,
            color: true,
            idx: true,
            teacherId: true,
            teacher: {
              select: {
                id: true,
                enokiAcct: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: enokiLedSystem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "SERVER_ERROR",
    });
  }
}
