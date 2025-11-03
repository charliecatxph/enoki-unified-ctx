import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { id } = req.body;
  if (!id.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    await prisma.department.delete({
      where: { id }
    });
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
