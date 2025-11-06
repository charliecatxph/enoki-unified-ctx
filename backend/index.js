import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import master from "./routes/master.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { emitToAll, emitToSocket, initSocket } from "./lib/socket.js";
import cron from "node-cron";
import { prisma } from "./lib/prisma.js";
import moment from "moment";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const openPort = () => {
  const port = new SerialPort({
    path: process.env.RFID_PORT_PATH,
    baudRate: 115200,
    autoOpen: false, // we open manually to handle retry
  });

  const tryOpen = () => {
    port.open((err) => {
      if (err) {
        console.log("Cannot open RFID port :(");
        console.log("[RFID Trace] - ", err.message);
        console.log("Retrying in 2 seconds...");
        setTimeout(tryOpen, 2000); // retry after 2s
        return;
      }
      console.log("RFID port opened successfully!");
    });
  };

  tryOpen();

  return port;
};

const port = openPort();

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (data) => {
  let rfidBuf = data.split(" ");
  rfidBuf = rfidBuf.map((el) => el.replace(/\r/, ""));
  const tag = rfidBuf.shift();
  const result = rfidBuf.join(" ");

  if (tag === "[ENOKI-RFID-SIG]") {
    console.log("Emission complete.", result);
    emitToAll("sig", { type: "RFID-READ", data: result, dest: "KIOSK" });
  }
});

port.on("open", () => {
  console.log("Connected to E-Noki RFID Onboard Reader");
});

port.on("error", (err) => {
  console.log("Error connecting to E-Noki RFID Onboard Reader", err);
});

const app = express();
const server = createServer(app);

const corsInstance = cors({
  origin: ["http://localhost:9000"],
  credentials: true,
});

app.use(corsInstance);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(`/api/${process.env.VERSION}`, master);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

export const socketsConnected = new Map();

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);
  if (socket.handshake.auth?.id) {
    socketsConnected.set(socket.handshake.auth.id, socket.id);
  }
  console.log(socketsConnected);
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    socketsConnected.delete(socket.id);
  });
});

app.use((req, res, next) => {
  console.log("Incoming request: ", req.method, req.url);
  next();
});

server.listen(process.env.PORT, () => {
  console.log("Socket.IO server running");
  console.log("App is listening at PORT", process.env.PORT);
});

cron.schedule("* * * * *", async () => {
  // run every 5m
  console.log("checking for teachers...");

  const tstat = await prisma.teacherStatistics.findMany({
    where: {
      status: "IN_CLASS",
    },
    select: {
      id: true,
      status: true,
      teacher: {
        select: {
          schedule: true,
          enokiAcct: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  for (const stat of tstat) {
    const { teacher } = stat;
    const socketId = socketsConnected.get(stat.teacher.enokiAcct.id);

    const __todayIdx = (moment().isoWeekday() - 1) % 7;
    const currentSchedule = teacher.schedule[__todayIdx];

    if (currentSchedule.dayOff) {
      await prisma.teacherStatistics.update({
        where: {
          id: stat.id,
        },
        data: {
          status: "OUT",
        },
      });

      if (socketId) {
        emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
      }
      emitToAll("sig", { type: "STATUS-CHANGE", data: null });
      return;
    }

    for (const classTime of currentSchedule.classTimes) {
      if (
        moment().isBetween(
          moment().startOf("day").add(classTime.cS, "seconds"),
          moment().startOf("day").add(classTime.cE, "seconds")
        )
      ) {
        await prisma.teacherStatistics.update({
          where: {
            id: stat.id,
          },
          data: {
            status: "IN_CLASS",
          },
        });

        if (socketId) {
          emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
        }
        emitToAll("sig", { type: "STATUS-CHANGE", data: null });
        return;
      } else {
        await prisma.teacherStatistics.update({
          where: {
            id: stat.id,
          },
          data: {
            status: "OUT",
          },
        });

        if (socketId) {
          emitToSocket(socketId, "sig", { type: "STATUS-CHANGE-SCANNER" });
        }
        emitToAll("sig", { type: "STATUS-CHANGE", data: null });
        return;
      }
    }
  }
});
