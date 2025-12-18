import { NextResponse } from "next/server";

export function middleware(request) {
    const { nextUrl } = request;

    // Explicitly skip authentication for ALL API routes
    if (nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const basicAuth = request.headers.get("authorization");

    // Only protect if APP_PASSWORD is set in Vercel
    const adminPassword = process.env.APP_PASSWORD;

    if (adminPassword) {
        if (basicAuth) {
            try {
                const authValue = basicAuth.split(" ")[1];
                // Using atob for Edge Runtime compatibility
                const [user, pwd] = atob(authValue).split(":");

                const adminUser = process.env.APP_USER || "admin";

                if (user === adminUser && pwd === adminPassword) {
                    return NextResponse.next();
                }
            } catch (e) {
                console.error("Auth parsing error", e);
            }
        }

        return new NextResponse("Unauthorized.", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
