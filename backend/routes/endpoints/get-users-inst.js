import { prisma } from "../../lib/prisma.js";

export default async (req, res) => {
    const { institutionId } = req.query;
    if (!institutionId.trim()) {
        return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
    }
    try {
        const users = await prisma.enokiAcct.findMany({
            where: {
                institutionId: institutionId.trim()
            },
            orderBy: {
                name: "asc"
            }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.status(400).json({ code: "SERVER_ERROR" });
    }
};
