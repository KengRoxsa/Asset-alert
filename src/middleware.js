import { NextResponse } from "next/server";

export function middleware(request) {
    const basicAuth = request.headers.get("authorization");

    if (process.env.APP_PASSWORD) {
        if (basicAuth) {
            const authValue = basicAuth.split(" ")[1];
            const [user, pwd] = Buffer.from(authValue, "base64").toString().split(":");

            // Use defaults if not set, or specific ENV values
            const adminUser = process.env.APP_USER || "admin";
            const adminPassword = process.env.APP_PASSWORD;

            if (user === adminUser && pwd === adminPassword) {
                return NextResponse.next();
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
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
