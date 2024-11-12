import { db } from "@/lib/db";

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { start: "asc" },
    });

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch events", { status: 500 });
  }
}
