import "dotenv/config";
import jwt from "jsonwebtoken";
import { sign } from "../../dependencies/jwt_sign.js";
const SECRET_REFRESH = process.env.SECRET_REFRESH;
import { prisma } from "../../lib/prisma.js";

export default async function rehydrate(req, res) {
 const refreshToken = req.headers?.cookie || "";
 if (!refreshToken) {
  return res.status(500).json({
   code: "TOKEN_MISSING",
  });
 }

 try {
  const refreshTokenDecode = jwt.verify(refreshToken, SECRET_REFRESH);

  const id = refreshTokenDecode.id;

  const acct = await prisma.enokiAcct.findFirst({
   where: {
    id: id
   },
   include: {
    institution: true
   }
  })

  if (!acct) {
   return res.status(401).json({
    code: "AUTHENTICATION_ERROR",
   });
  }

  const { accessToken: newAccessToken } = sign({
   userId: acct.id,
   institutionId: acct.institutionId,
   name: acct.institution.name,
   email: acct.email,
   actType: acct.actType,
   createdAt: acct.createdAt,
   updatedAt: acct.updatedAt,
   ownerName: acct.name,
  });
  res.status(200).json({
   token: newAccessToken,
  });
 } catch (e) {
  console.log(
   `[${new Date().toISOString()}] [User Rehydration] Exception at ${req.originalUrl}. Error data: ${e.message}`
  );
  res.status(401).json({
   err: "AUTHENTICATION_ERROR",
  });
 }
};
