import { NextResponse } from "next/server";

export function middleware(request) {
    const { nextUrl } = request;
    const secret = nextUrl.searchParams.get("secret");

    // 🤖 VIP Pass: If the secret matches our CRON_SECRET, or it's an API route, let it pass Basic Auth!
    if (
        (secret && secret === process.env.CRON_SECRET) ||
        nextUrl.pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // 🔒 Basic Auth Protection for the dashboard
    const adminPassword = process.env.APP_PASSWORD;

    if (adminPassword) {
        const basicAuth = request.headers.get("authorization");
        if (basicAuth) {
            try {
                const authValue = basicAuth.split(" ")[1];
                // Edge-compatible base64 decoding
                const decoded = atob(authValue);
                const [user, pwd] = decoded.split(":");

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
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
