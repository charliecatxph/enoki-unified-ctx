import { prisma } from "../../lib/prisma.js";

export default async function deleteAccount(req, res) {
    const { id } = req.body;
    if (!id.trim()) {
        return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
    }
    try {
        const acct = await prisma.enokiAcct.findUnique({
            where: {
                id: id,
            },
        });
        
        switch(acct.actType) {
            case "STUDENT": {
                await prisma.callTeacher.deleteMany({
                    where: {
                        studentId: acct.studentId
                    }
                })
    
                await prisma.student.delete({
                    where: {
                        id: acct.studentId
                    }
                })
    
                await prisma.enokiAcct.delete({
                    where: {
                        id: id
                    }
                })
                break;
            }
            case "TEACHER": {
                await prisma.gateScan.deleteMany({
                    where: {
                        teacherId: acct.teacherId
                    }
                })
                await prisma.callTeacher.deleteMany({
                    where: {
                        teacherId: acct.teacherId
                    }
                })
                await prisma.teacherStatistics.delete({
                    where: {
                        teacherId: acct.teacherId
                    }
                })
                await prisma.teacher.delete({
                    where: {
                        id: acct.teacherId
                    }
                })
                await prisma.enokiAcct.delete({
                    where: {
                        id: id
                    }
                })
                break;
            }
            case "ADMIN": {
                const adminCount = await prisma.enokiAcct.count({
                    where: {
                        institutionId: acct.institutionId,
                        actType: "ADMIN"
                    }
                })

                const ownerCount = await prisma.enokiAcct.count({
                    where: {
                        institutionId: acct.institutionId,
                        actType: "OWNER"
                    }
                })

                const x = (adminCount + ownerCount) - 1;
                if (x < 1) {
                    throw new Error("Last superuser cannot be deleted.")
                }
                await prisma.enokiAcct.delete({
                    where: {
                        id: id
                    }
                })
                break;
            }
            case "OWNER": {
                throw new Error("Owner cannot be deleted.")
            }
            default: {
                await prisma.enokiAcct.delete({
                    where: {
                        id: id
                    }
                })
                break;
            }
        }

        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}