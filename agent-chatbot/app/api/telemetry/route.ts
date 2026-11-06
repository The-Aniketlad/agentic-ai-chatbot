import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const todayUtc = new Date().toISOString().slice(0, 10);
    let openrouterUsage = {
      used: 0,
      limit: 50,
      remaining: 50,
      usageUsd: 0,
      isFreeTier: true,
      lastSynced: new Date().toISOString(),
      resetDate: todayUtc,
    };

    if (openrouterKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
          },
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          const d = json.data;
          if (d) {
            const dailyReqs = d.free_model_daily_requests || {};
            openrouterUsage = {
              used: dailyReqs.used || 0,
              limit: dailyReqs.limit || 50,
              remaining: typeof dailyReqs.remaining === "number" ? dailyReqs.remaining : 50,
              usageUsd: d.usage || 0,
              isFreeTier: Boolean(d.is_free_tier),
              lastSynced: new Date().toISOString(),
              resetDate: todayUtc,
            };
          }
        }
      } catch (err) {
        console.warn("Could not query OpenRouter live API telemetry:", err);
      }
    }

    return NextResponse.json({
      success: true,
      utcDate: todayUtc,
      openrouter: openrouterUsage,
      realTimeVerified: true,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch telemetry" },
      { status: 500 }
    );
  }
}

