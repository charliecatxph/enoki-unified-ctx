import { prisma } from "../../lib/prisma.js";

export default async function checkRfid(req, res) {
    const { rfid, institutionId } = req.body;
    if (!rfid.trim() || !institutionId.trim()) {
        return res.status(400).json({ success: false, error: "PARAMETERS_INCOMPLETE" });
    }
    try {
        const checkTeacher = await prisma.teacher.findFirst({
            where: {
                employeeRfidHash: rfid.trim().toUpperCase(),
                enokiAcct: {
                    institutionId: institutionId.trim()
                }
            }
        });

        const checkStudent = await prisma.student.findFirst({
            where: {
                studentRfidHash: rfid.trim().toUpperCase(),
                enokiAcct: {
                    institutionId: institutionId.trim()
                }
            }
        })

        if (checkTeacher || checkStudent) {
            throw new Error("Existing.")
        }
        res.sendStatus(200);


    } catch (error) {
        console.log(error)
        res.sendStatus(400);
    }
}