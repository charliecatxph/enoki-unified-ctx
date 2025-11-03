import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import master from "./routes/master.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { initSocket } from "./lib/socket.js";
import fs from "fs";
import axios from "axios";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { prisma } from "./lib/prisma.js";

// const oldJSON = JSON.parse(
//   fs.readFileSync("./kioskDB.faculties.json", "utf-8")
// );

// function timeToUnixSeconds(timeStr) {
//   const [hours, minutes] = timeStr.split(":").map(Number);
//   return hours * 3600 + minutes * 60;
// }

// function nameToEmail(fullName, domain = "lucena.sti.edu.ph") {
//   // Split by comma, fallback to empty string if missing
//   const [last = "", first = ""] = fullName
//     .split(",")
//     .map((s) => s.trim().toLowerCase());

//   // Take only the first given name (if exists)
//   const firstName = first ? first.split(" ")[0] : "user";

//   return `${last}.${firstName}@${domain}`;
// }

// function getDeptTrsn(name) {
//   switch (name) {
//     case "Arts and Science Tertiary Dept": {
//       return "06b221bd-910b-4931-8c62-bf8c2c0f6a0b";
//     }
//     case "Arts and Science SHS Dept": {
//       return "06b221bd-910b-4931-8c62-bf8c2c0f6a0b";
//     }
//     case "BM Tertiary Dept": {
//       return "00569daf-2067-4ac1-8e82-d88f763900b3";
//     }
//     case "BM SHS Dept": {
//       return "00569daf-2067-4ac1-8e82-d88f763900b3";
//     }
//     case "GE Tertiary Dept": {
//       return "803344c2-8dcc-4d4f-a709-83305e2817ca";
//     }
//     case "GE SHS Dept": {
//       return "803344c2-8dcc-4d4f-a709-83305e2817ca";
//     }
//     case "ICT/ENGG Tertiary Dept": {
//       return "d5af2912-6bf9-40c4-9dcf-b33df659e27b";
//     }
//     case "ICT/ENGG SHS Dept": {
//       return "d5af2912-6bf9-40c4-9dcf-b33df659e27b";
//     }
//     case "THM Tertiary Dept": {
//       return "7ebadcff-5558-4cda-a2ba-beb819c0ed67";
//     }
//     case "ABCOMM Dept": {
//       return "4108122f-c793-4d81-a8e8-15ec3dccdd42";
//     }
//   }
// }

// const newJSON = oldJSON.map((faculty, i) => {
//   const wksched = Object.entries(faculty.weeklySchedule).map(([day, value]) => {
//     if (value.dayOff) return { dayOff: true };
//     const dayx = value.classTimes.map((time) => {
//       return {
//         cS: timeToUnixSeconds(time.classStart),
//         cE: timeToUnixSeconds(time.classEnd),
//       };
//     });
//     const breakx = value.breakTimes.map((time) => {
//       return {
//         bS: timeToUnixSeconds(time.breakStart),
//         bE: timeToUnixSeconds(time.breakEnd),
//       };
//     });
//     return { dayOff: false, classTimes: dayx, breakTimes: breakx };
//   });

//   const td = {
//     name: faculty.name,
//     rfid: i + 1,
//     departmentId: getDeptTrsn(faculty.department.trim()),
//     weeklySchedule: wksched,
//     email: nameToEmail(faculty.name.trim()),
//   };
//   return td;
// });

// Promise.all(
//   newJSON.map((d, i) => {
//     return axios
//       .post("http://localhost:10000/api/alpha/add-teacher", {
//         name: d.name,
//         email: d.email,
//         employeeRfidHash: randomUUID(),
//         schedule: d.weeklySchedule,
//         institutionId: "898b4819-1877-41b4-aae4-d16f571ddb3b",
//         departmentId: d.departmentId,
//       })
//       .then(() => {
//         console.log("Imported: ", d.name);
//       })
//       .catch((e) => {
//         console.log(e.message);
//       });
//   })
// ).then((d) => {
//   console.log("Import complete.");
// });

// console.log("Used import.");

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
