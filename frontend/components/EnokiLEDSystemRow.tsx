import { useState } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Calendar,
  Cpu,
  Edit2,
  Save,
  X,
} from "lucide-react";
import moment from "moment";
import { EnokiLEDSystem } from "@/types/enokiLedSystem";
import EnokiLEDSystemDetails from "./EnokiLEDSystemDetails";

export default function EnokiLEDSystemRow({
  ledSystem,
  facultyData,
}: {
  ledSystem: EnokiLEDSystem;
  facultyData: any[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStateColor = (state: number) => {
    // Convert byte to binary and check active LEDs
    const activeLeds = state
      .toString(2)
      .split("")
      .filter((bit) => bit === "1").length;
    const totalLeds = ledSystem.physicalLeds.length;

    if (activeLeds === 0) return "bg-gray-100 text-gray-800";
    if (activeLeds === totalLeds) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStateText = (state: number) => {
    const activeLeds = state
      .toString(2)
      .split("")
      .filter((bit) => bit === "1").length;
    const totalLeds = ledSystem.physicalLeds.length;

    if (activeLeds === 0) return "All Off";
    if (activeLeds === totalLeds) return "All On";
    return `${activeLeds}/${totalLeds} Active`;
  };

  return (
    <li className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* Main Row - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Lightbulb className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {ledSystem.name}
              </p>
              <p className="text-xs text-slate-500">
                ID: {ledSystem.deviceSID.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* Installation Date and LED Count */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar size={14} className="text-slate-400" />
              <p className="text-xs text-slate-600">
                {moment(ledSystem.installedAt).format("MMM D, YYYY")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Cpu size={14} className="text-slate-400" />
              <p className="text-xs text-slate-600">
                {ledSystem.physicalLeds.length} LEDs
              </p>
            </div>
          </div>

          {/* Current State */}
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStateColor(
                ledSystem.currentState
              )}`}
            >
              {getStateText(ledSystem.currentState)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              State: 0b{ledSystem.currentState.toString(2).padStart(8, "0")}
            </p>
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              {isExpanded ? "Hide LEDs" : "Show LEDs"}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable LED Details Section */}
      {isExpanded && (
        <EnokiLEDSystemDetails ledSystem={ledSystem} isInline={true} facultyData={facultyData} />
      )}
    </li>
  );
}
