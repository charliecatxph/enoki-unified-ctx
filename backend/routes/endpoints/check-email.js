import { prisma } from "../../lib/prisma.js";

export default async function checkEmail(req, res) {
    const { email } = req.body;

    if (!email.trim() ) {
        return res.status(400).json({ success: false, error: "PARAMETERS_INCOMPLETE" });
    }
    try {
        const exists = await prisma.enokiAcct.findUnique({
            where: {
                email: email.trim(),
                // institutionId: institutionId.trim()
                // Implies that every teacher must have a unique enoki email per instance.
            }
        });

        if (exists) {
            console.log("EXISTS")
            throw new Error("Email exists.")
        } 

        console.log("DOES NOT EXISTS")
        res.sendStatus(200);
    } catch (error) {
        console.log(error)
        res.sendStatus(400);
    }
}