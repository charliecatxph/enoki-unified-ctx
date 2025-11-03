import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { id, name } = req.body;
  if (!id.trim() || !name.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    const course = await prisma.course.update({
      where: { id: id },
      data: {
        name,
      }
    });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
