import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userId } = useAuth();
  useEffect(() => {
    if (!userId) return;
    const socket = io(process.env.EXPO_PUBLIC_API_SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        id: userId,
      },
    });

    socket.on("sig", (dx) => {
      if (dx.type === "STATUS-CHANGE-SCANNER") {
        queryClient.invalidateQueries({
          queryKey: ["user"],
          exact: false,
        });
      } else if (dx.type === "MESSAGE-SENT") {
        queryClient.invalidateQueries({
          queryKey: ["messages"],
          exact: false,
        });
      }
    });

    setSocket(socket);
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
