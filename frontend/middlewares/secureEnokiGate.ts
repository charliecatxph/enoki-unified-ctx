import { GetServerSidePropsContext } from "next";
import jwt from "jsonwebtoken";
import axios from "axios";
import { parse } from "cookie";

type Role = "OWNER" | "ADMIN" | "KIOSK" | "STUDENT" | "TEACHER";

const accessRules: Record<Role, string[]> = {
  OWNER: [
    "/",
    "/teachers",
    "/departments",
    "/courses",
    "/students",
    "/enoki-userauth",
    "/enoki-sysconf",
  ],
  ADMIN: [
    "/",
    "/teachers",
    "/departments",
    "/courses",
    "/students",
    "/enoki-userauth",
    "/enoki-sysconf",
  ],
  KIOSK: ["/kiosk"],
  STUDENT: [],
  TEACHER: [],
};

const passThrough = ["/enoki-inst-reg"];

export const authGate = async (ctx: GetServerSidePropsContext) => {
  const cookie = parse(ctx.req.headers.cookie || "")?.refreshToken || "";
  const { query } = ctx;
  const server = process.env.API;

  const resolvedUrl = ctx.resolvedUrl.split("?")[0];

  try {
    const res = await axios.post(
      `${server}/rehydrate`,
      {},
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    const userData: any = {
      ...(jwt.decode(res.data.token) as object),
      token: res.data.token,
    };

    if (passThrough.includes(resolvedUrl)) {
      return {
        props: { user: null },
      };
    }

    if (resolvedUrl === "/invalid-user-permissions") {
      return {
        props: { user: userData },
      };
    } // debounce

    const isAllowed = (accessRules[userData.actType as Role] || []).includes(
      resolvedUrl
    );
    if (!isAllowed) {
      const fallbackRoutes: any = {
        OWNER: "/",
        ADMIN: "/",
        KIOSK: "/kiosk",
      };

      const destination =
        fallbackRoutes[userData.actType as Role] || "/invalid-user-permissions";

      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: userData,
        queries: query,
      },
    };
  } catch (e) {
    if (resolvedUrl === "/login") {
      return {
        props: { user: null },
      };
    } // debounce

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
