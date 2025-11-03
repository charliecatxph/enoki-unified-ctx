import "dotenv/config";
import { sign } from "../../dependencies/jwt_sign.js";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email.trim() || !password.trim()) {
    return res.status(400).json({
      code: "PARAMETERS_INCOMPLETE",
    });
  }

  try {

    const acct = await prisma.enokiAcct.findUnique({
      where: {
        email: email.trim()
      },
      include: {
        institution: true
      }
    });

    console.log(acct)

    if (!acct) {
      return res.status(400).json({
        code: "USER_NOT_FOUND",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, acct.password);


    if (!isPasswordCorrect) {
      return res.status(400).json({
        code: "INVALID_CREDENTIALS",
      });
    }

    const { accessToken, refreshToken } = sign({
      id: acct.id,
      institutionId: acct.institutionId,
      name: acct.institution.name,
      email: acct.email,
      actType: acct.actType,
      createdAt: acct.createdAt,
      updatedAt: acct.updatedAt,
      ownerName: acct.name,
    });

    console.log(refreshToken)

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.MODE === "PRODUCTION",
      sameSite: process.env.MODE === "PRODUCTION" ? "None" : "Lax",
      path: "/",
      domain:
        process.env.MODE === "PRODUCTION" ? process.env.SERVER_URL : "localhost",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.MODE === "PRODUCTION", // Ensures it is only sent over HTTPS
      sameSite: process.env.MODE === "PRODUCTION" ? "None" : "Lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      domain:
        process.env.MODE === "PRODUCTION" ? process.env.SERVER_URL : "localhost",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      msg: "User has been logged in.",
      token: accessToken,
    });
  } catch (e) {
    console.log(
      `[${new Date().toISOString()}] [Login] Exception at ${req.originalUrl}. Error data: ${e.message}`
    );
    return res.status(500).json({
      code: "SERVER_ERROR",
      err: e.message,
    });
  }
};

export { login };