import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

const removeStudentData = async (id) => {
    const acct = await prisma.enokiAcct.findUnique({
        where: {
            id: id
        }
    })

    if (!acct.studentId) return;

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
}

const removeTeacherData = async (id) => {
    const acct = await prisma.enokiAcct.findUnique({
        where: {
            id: id
        }
    })

    if (!acct.teacherId) return;

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
}

export default async function changeAcct(req, res) {
    const { id, name, email, actType, password = "" } = req.body;
    if (!id.trim() || !name.trim() || !email.trim() || !actType.trim()) {
        return res.status(400).json({ code: "PARAMETERS_INCOMPLETE" });
    }
    try {

        const acct = await prisma.enokiAcct.findUnique({
            where: {
                id: id
            }
        })

        const oldActType = acct.actType;
        
        if (oldActType !== actType) { // ADMIN -> STUDENT
            console.log("ACTTYPE CHANGE DETECTED", oldActType, actType)
            console.log("REMOVING DATA")
            await removeStudentData(id);
            await removeTeacherData(id);
            console.log("DATA REMOVED")
            switch(actType) {
                case "TEACHER": {
                    console.log("CREATING TEACHER")
                    await prisma.teacher.create({
                        data: {
                            employeeRfidHash: "N/A",
                            schedule: [{"dayOff": true}, {"dayOff": true}, {"dayOff": true}, {"dayOff": true}, {"dayOff": true}, {"dayOff": true}, {"dayOff": true}],
                            statistics: {
                                create: {
                                    status: "OUT"
                                }
                            },
                            enokiAcct: {
                                connect: {
                                    id: id
                                }
                            }
                        }
                    })
                    console.log("TEACHER CREATED")
                    break;
                }
                case "STUDENT": {
                    console.log("CREATING STUDENT")
                    await prisma.student.create({
                        data: {
                            studentId: "N/A",
                            studentRfidHash: "N/A",
                            enokiAcct: {
                                connect: {
                                    id: id
                                }
                            }
                        }
                    })
                    console.log("STUDENT CREATED")
                    break;
                }
            }
        }

        const updateData = {
            name,
            email,
            actType,
        };

        if (password && password.trim()) {
            const hash = await bcrypt.hash(password, 10);
            updateData.password = hash;
        }
        console.log("UPDATING ACCOUNT")
        await prisma.enokiAcct.update({
            where: {
                id: id
            },
            data: updateData
        })
        console.log("ACCOUNT UPDATED")
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}