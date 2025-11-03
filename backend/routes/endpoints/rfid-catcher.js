import { emitToAll } from "../../lib/socket.js";

export default async (req, res) => {
 try {
  const rfidData = req.body["rfid-dat"];

  if (!rfidData) {
   return res.status(400).json({
    success: false,
    message: "RFID data is required"
   });
  }

  // Emit the RFID signal to all connected clients
  emitToAll("sig", { type: "RFID-READ", data: rfidData, dest: "KIOSK" });

  res.status(200).json({
   success: true,
   message: "RFID signal emitted successfully",
   data: { rfidData }
  });

 } catch (error) {
  console.error("Error in rfid-catcher:", error);
  res.status(500).json({
   success: false,
   message: "Internal server error"
  });
 }
};