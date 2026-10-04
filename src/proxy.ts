import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const roleHome: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("edumanage_token")?.value;
  const user = token ? verifyToken(token) : null;

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const section = pathname.split("/")[2]; // admin | teacher | student
    if (section && section.toUpperCase() !== user.role) {
      return NextResponse.redirect(new URL(roleHome[user.role], req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
