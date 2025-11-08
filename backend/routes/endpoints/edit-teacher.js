import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { id, email, name, employeeRfidHash, departmentId, schedule } =
    req.body;

  if (
    !id.trim() ||
    !name.trim() ||
    !email.trim() ||
    !departmentId.trim() ||
    !employeeRfidHash.trim() ||
    !JSON.stringify(schedule).trim()
  ) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }

  try {
    await prisma.enokiAcct.update({
      where: {
        teacherId: id,
      },
      data: {
        name,
        email,
      },
    });

    await prisma.teacher.update({
      where: {
        id: id,
      },
      data: {
        schedule,
        employeeRfidHash: employeeRfidHash.trim().toUpperCase(),
        department: {
          connect: {
            id: departmentId,
          },
        },
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
