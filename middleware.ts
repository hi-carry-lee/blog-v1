import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute = ["/auth/login", "/auth/register"].includes(
    nextUrl.pathname
  );
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  // if (!isLoggedIn && !isPublicRoute) {
  //   return NextResponse.redirect(new URL("/register", nextUrl));
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
