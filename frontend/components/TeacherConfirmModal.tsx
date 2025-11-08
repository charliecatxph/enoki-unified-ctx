import { X } from "lucide-react";
import { Teacher } from "./AddEditTeacherModal";
import { AnimatePresence } from "framer-motion";

const getStatusText = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "IN_CLASS":
      return "In Class";
    case "IN_BREAK":
      return "On Break";
    case "IN_BUSY":
      return "Busy";
    case "OUT":
      return "Out";
    default:
      return "Unknown";
  }
};

interface TeacherConfirmModalProps {
  showConfirmModal: boolean;
  confirmModalTeacher: Teacher | null;
  handleCloseConfirmModal: () => void;
  handleConfirmNotify: () => void;
}

export default function TeacherConfirmModal({
  showConfirmModal,
  confirmModalTeacher,
  handleCloseConfirmModal,
  handleConfirmNotify,
}: TeacherConfirmModalProps) {
  return (
    <AnimatePresence>
      {showConfirmModal && confirmModalTeacher && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Notify Instructor
              </h2>
              <button
                onClick={handleCloseConfirmModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size="24" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4 ">
                <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {confirmModalTeacher.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .filter(
                      (_: any, i: number, arr: any[]) =>
                        i < 2 || i === arr.length - 1
                    )
                    .join("")}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {confirmModalTeacher.name}
                  </h3>
                  <p className="text-gray-600">
                    {confirmModalTeacher.department?.name || "Department"}
                  </p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mt-1">
                    Available
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This instructor is currently available.
                  You can notify them directly to get their attention.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseConfirmModal}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNotify}
                className="flex-1 bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors duration-200"
              >
                Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
