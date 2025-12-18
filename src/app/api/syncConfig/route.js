import { kv } from "@vercel/kv";

export async function POST(request) {
    try {
        const { stocks, crypto, secret } = await request.json();

        // Security check
        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // Save to Vercel KV
        await kv.set("alert_config", {
            stocks: stocks || [],
            crypto: crypto || [],
            updatedAt: new Date().toISOString()
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
