"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation"; // Added import for useSearchParams

const DiscordNotifier = ({ stocks, crypto }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const searchParams = useSearchParams(); // Initialized useSearchParams

    const sendToDiscord = async () => {
        setLoading(true);
        setStatus(null);
        try {
            // The logic below seems to be intended for the API route, not the client component.
            // For the client component, we will continue to use the props `stocks` and `crypto`
            // to construct the query parameters for the `/api/sendPrices` endpoint.
            // The KV synchronization logic should reside in the `/api/sendPrices` route handler itself.

            const stockQuery = stocks.join(",");
            const cryptoQuery = crypto.join(",");
            const res = await fetch(`/api/sendPrices?stocks=${encodeURIComponent(stockQuery)}&crypto=${encodeURIComponent(cryptoQuery)}`);
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: "success", message: "Sent to Discord successfully!" });
            } else {
                setStatus({ type: "error", message: data.error || "Failed to send to Discord" });
            }
        } catch (err) {
            setStatus({ type: "error", message: "Network error occurred" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 p-4 bg-white border rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-black">Discord Notifications</h2>
            <div className="flex flex-wrap items-center gap-4">
                <button
                    onClick={sendToDiscord}
                    disabled={loading}
                    className={`${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                        } text-white px-6 py-2 rounded transition-colors flex items-center gap-2`}
                >
                    {loading ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Sending...
                        </>
                    ) : (
                        "Send Current Prices to Discord"
                    )}
                </button>

                <button
                    onClick={async () => {
                        setLoading(true);
                        setStatus(null);
                        try {
                            const secret = prompt("Enter your CRON_SECRET to save settings:");
                            if (!secret) {
                                setLoading(false);
                                return;
                            }
                            const res = await fetch('/api/syncConfig', {
                                method: 'POST',
                                body: JSON.stringify({ stocks, crypto, secret }),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            if (res.ok) {
                                setStatus({ type: "success", message: "Auto-Alert settings balanced!" });
                            } else {
                                setStatus({ type: "error", message: "Failed to sync settings" });
                            }
                        } catch (e) {
                            setStatus({ type: "error", message: "Error syncing" });
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors"
                >
                    Sync for Auto-Alert 🔁
                </button>

                {status && (
                    <span className={`${status.type === "success" ? "text-green-600" : "text-red-600"
                        } font-medium`}>
                        {status.message}
                    </span>
                )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
                "Send" sends immediately. "Sync" saves these assets for the automated hourly alerts.
            </p>
        </div>
    );
};

export default DiscordNotifier;
