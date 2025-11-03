import {
  ArrowUpRight,
  BadgeQuestionMark,
  CheckCircle,
  CreditCardIcon,
  XCircle,
  X,
} from "lucide-react";
import { Teacher } from "./AddEditTeacherModal";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import { CircularProgress } from "@mui/material";
import { useRfidSocket } from "@/utils/useRfidSocket";
import axios from "axios";
import { useEnokiMutator } from "@/hooks/useEnokiMutator";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function NotifyTeacher({
  api,
  teacher,
  institutionId,
  close,
}: {
  api: string;
  teacher: Teacher;
  institutionId: string;
  close: () => void;
}) {
  const { notifyTeacher } = useEnokiMutator();
  const [localData, setLocalData] = useState({
    studentData: {
      id: "",
      name: "",
    },
  });

  const [step, setStep] = useState(0); // 0: RFID scan, 1: Notifying, 2: Success

  const {
    rfidData,
    isOnline: rfidReaderOnline,
    isPulsing: rfidPulse,
  } = useRfidSocket({
    enabled: step === 0,
    onRfidData: (data: any) => {
      if (data.type !== "RFID-READ") return;
      if (data.dest !== "KIOSK") return;
      setRfidStat((pv) => ({
        ...pv,
        detected: true,
        data: {
          id: data.data,
        },
      }));
    },
    playSound: true,
    soundFile: "notification.mp3",
  });

  const [rfidStat, setRfidStat] = useState({
    detected: false,
    err: "",
    data: {
      id: "",
    },
  });

  const [notifyStatus, setNotifyStatus] = useState("");

  const notifyTeacherHandler = async (studentId: string) => {
    try {
      setNotifyStatus("pending");
      await notifyTeacher.mutateAsync({
        studentId: studentId,
        recipientId: teacher.id,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifyStatus("success");
      setStep(2);
    } catch (e) {
      console.log("Notification failed");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNotifyStatus("error");
    }
  };

  const getStudentInformation = async () => {
    try {
      const res = await axios.post(`${api}/get-student-info`, {
        studentRfidHash: rfidStat.data.id,
        institutionId: institutionId,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLocalData((pv) => ({
        ...pv,
        studentData: {
          id: res.data.data.id,
          name: res.data.data.enokiAcct.name,
        },
      }));
      setStep(1);
      notifyTeacherHandler(res.data.data.id);
    } catch (e: any) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (e.response.data.error === "STUDENT_NOT_FOUND") {
        setRfidStat((pv) => ({
          ...pv,
          err: "Student not found.",
        }));
      }
    }
  };

  useEffect(() => {
    if (!rfidStat.detected) return;
    if (!rfidStat.data.id.trim()) return;

    getStudentInformation();
  }, [rfidStat.detected, rfidStat.data.id]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key="notify-bg-xt"
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={close}
      >
        {step === 0 && (
          <>
            {rfidStat.err ? (
              <CantFindStudent close={close} />
            ) : (
              <ScanRfidForNotification
                close={close}
                detected={rfidStat.detected}
                teacher={teacher}
              />
            )}
          </>
        )}

        {step === 1 && (
          <>
            {notifyStatus === "pending" && (
              <NotifyingTeacher
                name={localData.studentData.name}
                teacher={teacher}
              />
            )}
            {notifyStatus === "success" && (
              <NotificationSent close={close} teacher={teacher} />
            )}
            {notifyStatus === "error" && (
              <NotificationError
                tryAgain={() => {
                  setNotifyStatus("");
                  notifyTeacherHandler(localData.studentData.id);
                }}
              />
            )}
          </>
        )}
        {step === 2 && <NotificationSent close={close} teacher={teacher} />}
      </motion.div>
    </>
  );
}

const ScanRfidForNotification = ({
  close,
  detected,
  teacher,
}: {
  close: () => void;
  detected: boolean;
  teacher: Teacher;
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="notify-content-xt"
        className={`${poppins.className} bg-yellow-50 rounded-3xl shadow-2xl border-4 border-blue-700 p-8 w-full max-w-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icon mx-auto w-max bg-blue-700 text-yellow-100 p-5 rounded-full">
          <CreditCardIcon size="35" />
        </div>
        <h1 className="text-2xl font-bold text-blue-900 text-center mt-5">
          Scan your RFID
        </h1>
        <p className="text-center mt-2">
          Scan your RFID to notify {teacher.name}
        </p>
        <div className="mt-5 text-center bg-blue-200 py-2 rounded-md font-[500] text-blue-900 flex gap-3 items-center justify-center">
          {detected ? (
            <>
              <CircularProgress
                disableShrink
                size={12}
                color="inherit"
                thickness={10}
              />{" "}
              Checking your ID...
            </>
          ) : (
            <span>Approach your ID card to the reader...</span>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          {!detected && (
            <button
              onClick={close}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200"
            >
              Go Back
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

const CantFindStudent = ({ close }: { close: () => void }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="notify-content-xt"
        className={`${poppins.className} bg-red-50 rounded-3xl shadow-2xl border-4 border-red-700 p-8 w-full max-w-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icon mx-auto w-max bg-red-700 text-white p-5 rounded-full">
          <BadgeQuestionMark size="35" />
        </div>
        <h1 className="text-2xl font-bold text-red-900 text-center mt-5">
          Student not found
        </h1>
        <p className="text-center mt-2">
          You are not registered in the system. Please contact the school's
          E-Noki administrator.
        </p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={close}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-800 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
};

const NotifyingTeacher = ({
  name,
  teacher,
}: {
  name: string;
  teacher: Teacher;
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="notify-content-xt"
        className={`${poppins.className} bg-blue-50 rounded-3xl shadow-2xl border-4 border-blue-700 p-8 w-full max-w-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icon mx-auto w-max bg-blue-700 text-white p-5 rounded-full">
          <motion.div
            animate={{
              x: [0, 2, 0],
              y: [0, -2, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ArrowUpRight size="35" />
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-blue-900 text-center mt-5">
          Notifying Teacher
        </h1>
        <p className="text-center mt-2">
          Hello {name}, please wait while we notify {teacher.name}.
        </p>
      </motion.div>
    </>
  );
};

const NotificationSent = ({
  close,
  teacher,
}: {
  close: () => void;
  teacher: Teacher;
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="notify-content-xt"
        className={`${poppins.className} bg-green-50 rounded-3xl shadow-2xl border-4 border-green-700 p-8 w-full max-w-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icon mx-auto w-max bg-green-700 text-white p-5 rounded-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <CheckCircle size="35" />
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-green-900 text-center mt-5">
          Teacher Notified
        </h1>
        <p className="text-center mt-2">
          {teacher.name} has been successfully notified. They will receive your
          notification shortly.
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={close}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition-all duration-200"
          >
            Done
          </button>
        </div>
      </motion.div>
    </>
  );
};

const NotificationError = ({ tryAgain }: { tryAgain: () => void }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="notify-content-xt"
        className={`${poppins.className} bg-red-50 rounded-3xl shadow-2xl border-4 border-red-700 p-8 w-full max-w-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="icon mx-auto w-max bg-red-700 text-white p-5 rounded-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
          >
            <XCircle size="35" />
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-red-900 text-center mt-5">
          Notification Failed
        </h1>
        <p className="text-center mt-2">
          We couldn't notify the teacher. Please try again or contact support if
          the problem persists.
        </p>
        <div className="flex gap-2 mt-5">
          <button
            onClick={tryAgain}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-800 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    </>
  );
};
