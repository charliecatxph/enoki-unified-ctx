import { prisma } from "../../lib/prisma.js";

export default async function getStudentInf_id(req,res) {
    const {studentRfidHash, institutionId} = req.body;

    if (!studentRfidHash.trim() || !institutionId.trim()) {
        return res.status(400).json({ success: false, error: "PARAMETERS_INCOMPLETE" });
    }

    try {
        const student = await prisma.student.findFirst({
            where: {
                studentRfidHash: studentRfidHash.trim().toUpperCase(),
                enokiAcct: {
                    institutionId: institutionId.trim()
                }
            },
            include: {
                enokiAcct: {
                    select: {
                        name: true,
                    }
                }
            }
        })

        if (!student) {
            return res.status(404).json({ success: false, error: "STUDENT_NOT_FOUND" });
        }

        return res.status(200).json({ success: true, data: student });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, error: "SERVER_ERROR" });
    }
}