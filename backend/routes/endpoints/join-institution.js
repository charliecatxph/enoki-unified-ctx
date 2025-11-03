import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcrypt"

export default async (req, res) => {
    const { institutionId, name, email, password } = req.body;
    if (!institutionId.trim() || !name.trim() || !email.trim() || !password.trim()) {
        return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
    }
    try {
        const institution = await prisma.institution.findUnique({
            where: {
                id: institutionId.trim()
            }
        });
        if (!institution) {
            return res.status(400).json({ code: "INSTITUTION_NOT_FOUND" });
        }

        const acctCheck = await prisma.enokiAcct.findUnique({
            where: {
                email: email.trim()
            }
        });
        if (acctCheck) {
            return res.status(400).json({ code: "ACCOUNT_EXISTS" });
        }

        const hash = await bcrypt.hash(password, 10);
        const acct = await prisma.enokiAcct.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                password: hash,
                institution: {
                    connect: {
                        id: institution.id
                    }
                }
            }
        });
        res.json({ success: true, data: acct });
    } catch (error) {
        console.log(error);
        res.status(400).json({ code: "SERVER_ERROR" });
    }
};
