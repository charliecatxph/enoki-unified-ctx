import {
  ArrowUpRight,
  BadgeQuestionMark,
  CheckCircle,
  CreditCardIcon,
  FileQuestion,
  MessageSquare,
  XCircle,
  X,
} from "lucide-react";
import { Teacher } from "./AddEditTeacherModal";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Poppins, Sen } from "next/font/google";
import { CircularProgress } from "@mui/material";
import { useRfidSocket } from "@/utils/useRfidSocket";
import axios from "axios";
import { useEnokiMutator } from "@/hooks/useEnokiMutator";
import { useKeyboard } from "@/contexts/KeyboardContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function SendMessage({
  teacher,
  institutionId,
  close,
}: {
  teacher: Teacher;
  institutionId: string;
  close: () => void;
}) {
  const { initKeyboard } = useKeyboard();
  const { sendMessage } = useEnokiMutator();
  const [localData, setLocalData] = useState({
    message: {
      v: "",
      e: "",
    },
    studentData: {
      id: "",
      name: "",
    },
  });

  const handleSendMessage = () => {
    if (!localData.message.v.trim()) return;
    setStep(1);
  };

  const goBack = () => {
    setStep(0);
  };
  const [step, setStep] = useState(0);

  const {
    rfidData,
    isOnline: rfidReaderOnline,
    isPulsing: rfidPulse,
  } = useRfidSocket({
    enabled: step === 1,
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

  const [sendStatus, setSendStatus] = useState("");

  const sendMessageHandler = async (studentId: string) => {
    try {
      setSendStatus("pending");
      await sendMessage.mutateAsync({
        studentId,
        message: localData.message.v,
        recipientId: teacher.id,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSendStatus("success");
      setStep(3);
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSendStatus("error");
    }
  };

  const getStudentInformation = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/get-student-info`,
        {
          studentRfidHash: rfidStat.data.id,
          institutionId: institutionId,
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLocalData((pv) => ({
        ...pv,
        studentData: {
          id: res.data.data.id,
          name: res.data.data.enokiAcct.name,
        },
      }));
      setStep(2);
      sendMessageHandler(res.data.data.id);
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

  const handleOpenKeyboard = async () => {
    const value = await initKeyboard({
      placeholder: "Enter your message",
      initialValue: localData.message.v,
    });
    setLocalData((pv) => ({
      ...pv,
      message: { ...pv.message, v: value },
    }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key="message-bg-xt"
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={close}
      >
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            key="message-content-xt"
            className={`${poppins.className} bg-yellow-50 rounded-3xl shadow-2xl border-4 border-blue-700 p-8 w-full max-w-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex shrink-0 items-center justify-center text-yellow-300 font-bold text-2xl">
                  {teacher.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .filter(
                      (_: any, i: number, arr: any[]) =>
                        i < 2 || i === arr.length - 1
                    )
                    .join("")}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">
                    Send Message to {teacher.name}
                  </h2>
                  <p className="text-blue-600">
                    {teacher.department.name || "Department"}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="text-blue-700 hover:text-blue-900 transition-colors p-2 hover:bg-blue-100 rounded-full"
              >
                <X size="24" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-blue-900 font-semibold mb-2">
                Your Message
              </label>
              <textarea
                value={localData.message.v}
                onFocus={() => handleOpenKeyboard()}
                placeholder="Type your message here..."
                className="w-full h-40 px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-200 transition-all resize-none bg-white text-blue-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={close}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!localData.message.v.trim()}
                className="flex-1 bg-blue-700 text-yellow-100 px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Send Message
              </button>
            </div>
          </motion.div>
        )}
        {step === 1 && (
          <>
            {rfidStat.err ? (
              <CantFindStudent close={close} />
            ) : (
              <ScanRfid close={close} detected={rfidStat.detected} />
            )}
          </>
        )}

        {step === 2 && (
          <>
            {sendStatus === "pending" && (
              <SendingMessage name={localData.studentData.name} />
            )}
            {sendStatus === "success" && <MessageSent close={close} />}
            {sendStatus === "error" && (
              <SendingError
                tryAgain={() => {
                  sendMessageHandler(localData.studentData.id);
                }}
              />
            )}
          </>
        )}
        {step === 3 && <MessageSent close={close} />}
      </motion.div>
    </>
  );
}

const ScanRfid = ({
  close,
  detected,
}: {
  close: () => void;
  detected: boolean;
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="message-content-xt"
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
          Scan your RFID to send a message to the teacher
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
        key="message-content-xt"
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

const SendingMessage = ({ name }: { name: string }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="message-content-xt"
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
          Sending
        </h1>
        <p className="text-center mt-2">
          Hello {name}, please wait while we send your message to your teacher.
        </p>
      </motion.div>
    </>
  );
};

const MessageSent = ({ close }: { close: () => void }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="message-content-xt"
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
          Message Sent
        </h1>
        <p className="text-center mt-2">
          Your message has been successfully sent to your teacher. They will
          receive it shortly.
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

const SendingError = ({ tryAgain }: { tryAgain: () => void }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
        key="message-content-xt"
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
          Sending Failed
        </h1>
        <p className="text-center mt-2">
          We couldn't send your message. Please try again or contact support if
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
