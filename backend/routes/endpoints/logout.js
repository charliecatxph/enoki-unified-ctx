import "dotenv/config";

export default function logout(req, res) {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.MODE === "PRODUCTION", // Ensures it is only sent over HTTPS
        sameSite: process.env.MODE === "PRODUCTION" ? "None" : "Lax",
        path: "/",
      });
    res.json({ success: true });
}
