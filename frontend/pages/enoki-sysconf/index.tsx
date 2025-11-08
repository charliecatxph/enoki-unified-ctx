import {
  Lock,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Sun,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import { Inter, Poppins, Space_Grotesk } from "next/font/google";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar";
import { GetServerSidePropsContext } from "next";
import { authGate } from "@/middlewares/secureEnokiGate";
import { isUserDataComplete, selectUserData } from "@/redux/features/userSlice";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import EnokiLEDSystemRow from "@/components/EnokiLEDSystemRow";
import { EnokiLEDSystem } from "@/types/enokiLedSystem";
import Head from "next/head";
import { useRfidSocket } from "@/utils/useRfidSocket";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authGate(ctx);
}

export default function EnokiSysConf({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const userData = useSelector(selectUserData);
  const __userData = isUserDataComplete(userData) ? userData : user;

  const { rfidData } = useRfidSocket({
    enabled: true,
    onRfidData: (data) => {
      if (!["DSH-MESSAGE", "MESSAGE-SENT"].includes(data.type)) return;
      queryClient.invalidateQueries({
        queryKey: ["enoki-led-systems"],
      });
    },
    playSound: false,
    soundFile: "notification.mp3",
  });

  const {
    data: enokiLedSystems = [],
    isFetched: enokiLedSystemIsFetched,
    isPending: enokiLedSystemIsPending,
    isError: enokiLedSystemIsError,
    isFetching: enokiLedSystemIsFetching,
    isRefetching: enokiLedSystemIsRefetching,
    refetch: enokiLedSystemRefetch,
  } = useQuery({
    queryKey: ["enoki-led-systems"],
    queryFn: async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/get-enokiLedSystem`,
        {
          institutionId: __userData.institutionId,
        }
      );

      return res.data.data as EnokiLEDSystem[];
    },
    enabled: !!__userData.institutionId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const {
    data: facultyData = [],
    isPending: facultyPending,
    isError: facultyError,
    refetch: facultyRefetch,
  } = useQuery({
    queryKey: ["faculty"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/get-teachers`,
        {
          params: {
            institutionId: __userData.institutionId,
          },
        }
      );

      return res.data.data;
    },
    enabled: !!__userData.userId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return (
    <>
      <Head>
        <title>E-Noki - System Configuration</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${poppins.className} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen`}
      >
        <div className="flex">
          <Sidebar userData={__userData} />
          <div className="main-panel flex-1">
            <header
              className={`${inter.className} p-5 bg-blue-600 text-white w-full sticky top-0 z-10 flex gap-5 items-center`}
            >
              <div>
                <Sun size="30" strokeWidth={1.2} />
              </div>
              <div>
                <h1 className="font-[600] text-white text-sm">
                  System Configuration
                </h1>
                <p className="font-[400] text-white/70 text-xs">
                  Configure E-Noki System LED
                </p>
              </div>
            </header>
            <div className="p-6 space-y-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    LED Systems
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Manage and monitor your E-Noki LED systems
                  </p>
                </div>
                <button
                  onClick={() => enokiLedSystemRefetch()}
                  disabled={enokiLedSystemIsFetching}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw
                    size={18}
                    className={enokiLedSystemIsFetching ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {/* Loading State */}
              {enokiLedSystemIsPending && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CircularProgress size={40} className="text-blue-600" />
                    <p className="text-slate-600 mt-4">
                      Loading LED systems...
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {enokiLedSystemIsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertTriangle
                    className="text-red-500 mx-auto mb-2"
                    size={48}
                  />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Failed to Load LED Systems
                  </h3>
                  <p className="text-red-600 mb-4">
                    There was an error loading the LED systems. Please try
                    again.
                  </p>
                  <button
                    onClick={() => enokiLedSystemRefetch()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {enokiLedSystemIsFetched &&
                !enokiLedSystemIsError &&
                enokiLedSystems.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                    <Lightbulb
                      className="text-slate-400 mx-auto mb-4"
                      size={64}
                    />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No LED Systems Found
                    </h3>
                    <p className="text-slate-600 mb-6">
                      No LED systems are currently configured for your
                      institution.
                    </p>
                  </div>
                )}

              {/* LED Systems List */}
              {enokiLedSystemIsFetched &&
                !enokiLedSystemIsError &&
                enokiLedSystems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        {enokiLedSystems.length} LED system
                        {enokiLedSystems.length !== 1 ? "s" : ""} found
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {enokiLedSystems.map((ledSystem) => (
                        <EnokiLEDSystemRow
                          key={ledSystem.deviceSID}
                          ledSystem={ledSystem}
                          facultyData={facultyData}
                        />
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
