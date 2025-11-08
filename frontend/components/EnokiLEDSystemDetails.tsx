import { useState } from "react";
import {
  Lightbulb,
  User,
  Hash,
  Palette,
  Edit2,
  Save,
  X,
  UserX,
} from "lucide-react";
import moment from "moment";
import { EnokiLEDSystem, EnokiPhysicalLED } from "@/types/enokiLedSystem";
import { useEnokiMutator } from "@/hooks/useEnokiMutator";
import { useEnokiModals } from "@/contexts/EnokiModalContext";

interface EnokiLEDSystemDetailsProps {
  ledSystem: EnokiLEDSystem;
  isInline?: boolean;
  facultyData?: any[];
}

export default function EnokiLEDSystemDetails({
  ledSystem,
  isInline = false,
  facultyData = [],
}: EnokiLEDSystemDetailsProps) {
  const enokiModal = useEnokiModals();
  const { editEnokiLedSystem } = useEnokiMutator();
  const [editingLED, setEditingLED] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EnokiPhysicalLED>>({});

  // Faculty lookup function
  const getTeacherById = (teacherId: string | undefined) => {
    if (!teacherId) return null;
    return facultyData.find((teacher) => teacher.id === teacherId);
  };

  const getTeacherName = (teacherId: string | undefined) => {
    const teacher = getTeacherById(teacherId);
    return teacher ? teacher.name : "Unassigned";
  };
  const getLEDStatus = (idx: number, currentState: number) => {
    return (currentState >> idx) & 1 ? "On" : "Off";
  };

  const getLEDStatusColor = (idx: number, currentState: number) => {
    const isOn = (currentState >> idx) & 1;
    return isOn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getColorPreview = (color: string) => {
    // Handle hex colors, rgb, or named colors
    if (
      color.startsWith("#") ||
      color.startsWith("rgb") ||
      color.startsWith("hsl")
    ) {
      return color;
    }
    // For named colors, return as is (CSS will handle it)
    return color;
  };

  const handleEditLED = (led: EnokiPhysicalLED) => {
    setEditingLED(led.ledUq);
    setEditForm({
      ledUq: led.ledUq,
      color: led.color,
      teacherId: led.teacherId || "",
    });
  };

  const handleSaveEdit = async () => {
    // TODO: Implement save functionality
    console.log("Saving LED edit:", editForm);

    enokiModal.showModal({
      type: "warning",
      title: "Reference LED?",
      message: `Are you sure you want to reference this LED?`,
      cancelButtonText: "Close",
      hasCancelButton: true,
      hasConfirmButton: true,
      confirmButtonText: "Reference",
      confirmButtonFn: async () => {
        enokiModal.showModal({
          type: "loading",
          title: "Referencing...",
          message: "",
        });
        editEnokiLedSystem
          .mutateAsync({
            ledUq: editForm.ledUq,
            teacherId: editForm.teacherId,
          })

          .then(() => {
            enokiModal.showModal({
              type: "success",
              title: "LED Referenced",
              message: "LED referenced successfully.",
              cancelButtonText: "Close",
              hasCancelButton: true,
            });
          })
          .catch((e) => {
            enokiModal.showModal({
              type: "error",
              title: "Error Referencing LED",
              message: "An error occurred while referencing the LED.",
              cancelButtonText: "Close",
              hasCancelButton: true,
            });
          })
          .finally(() => {
            setEditingLED(null);
            setEditForm({});
          });
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingLED(null);
    setEditForm({});
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50">
      {/* System Info Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Installed
            </p>
            <p className="text-sm font-medium text-slate-900">
              {moment(ledSystem.installedAt).format("MMMM D, YYYY / hh:mm A")}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Total LEDs
            </p>
            <p className="text-sm font-medium text-slate-900">
              {ledSystem.physicalLeds.length} Physical LEDs
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Current State
            </p>
            <p className="text-sm font-medium text-slate-900">
              0b{ledSystem.currentState.toString(2).padStart(8, "0")} (
              {ledSystem.currentState})
            </p>
          </div>
        </div>
      </div>

      {/* LED List */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Physical LEDs
        </h3>

        {ledSystem.physicalLeds.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Lightbulb size={48} className="mx-auto mb-2 opacity-50" />
            <p>No LEDs configured for this system</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ledSystem.physicalLeds
              .sort((a, b) => a.idx - b.idx)
              .map((led) => (
                <div
                  key={led.ledUq}
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  {/* LED Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-slate-300"
                        style={{
                          backgroundColor: getColorPreview(
                            editingLED === led.ledUq
                              ? editForm.color || led.color
                              : led.color
                          ),
                        }}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        LED #{led.idx}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLEDStatusColor(
                          led.idx,
                          ledSystem.currentState
                        )}`}
                      >
                        {getLEDStatus(led.idx, ledSystem.currentState)}
                      </span>
                      {editingLED !== led.ledUq && (
                        <button
                          onClick={() => handleEditLED(led)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* LED Details - Editable */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-600">
                        {led.ledUq.slice(0, 12)}...
                      </span>
                    </div>

                    {/* Color Field */}
                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-slate-400" />

                      <span className="text-xs text-slate-600">
                        {led.color}
                      </span>
                    </div>

                    {/* Teacher Assignment Field */}
                    <div className="flex items-center gap-2">
                      {led.teacherId ? (
                        <User size={14} className="text-slate-400" />
                      ) : (
                        <UserX size={14} className="text-slate-300" />
                      )}

                      {editingLED === led.ledUq ? (
                        <select
                          value={editForm.teacherId || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              teacherId: e.target.value,
                            })
                          }
                          className="text-xs text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 flex-1"
                        >
                          <option value="">Unassigned</option>
                          {facultyData.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`text-xs ${
                            led.teacherId
                              ? "text-slate-600"
                              : "text-slate-400 italic"
                          }`}
                        >
                          {getTeacherName(led.teacherId)}
                        </span>
                      )}
                    </div>

                    {/* Edit Actions */}
                    {editingLED === led.ledUq && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <Save size={12} />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          <X size={12} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
