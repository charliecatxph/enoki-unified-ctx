import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { id, name } = req.body;
  if (!id.trim() || !name.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
      }
    });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
