export default async function checkStudentId(req, res) {
    const { studentId, institutionId } = req.body;

    if (!studentId.trim() || !institutionId.trim()) {
        return res.status(400).json({ success: false, error: "PARAMETERS_INCOMPLETE" });
    }

    try {
        const exists = await prisma.student.findFirst({
            where: {
                studentId: studentId.trim().toUpperCase(),
                enokiAcct: {
                    institutionId: institutionId.trim()
                }
            }
        })

        if (exists) {
            throw new Error("Student ID exists.")
        }

        res.sendStatus(200);
    } catch(e) {
        console.log(e)
        return res.sendStatus(400)
    }
}