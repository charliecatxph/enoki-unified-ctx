import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
  const { name, institutionId } = req.body;
  console.log(req.body)
  if (!name.trim() || !institutionId.trim()) {
    return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
  }
  try {
    const department = await prisma.department.create({
      data: {
        name,
        institution: {
          connect: {
            id: institutionId
          }
        }
      }
    });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
