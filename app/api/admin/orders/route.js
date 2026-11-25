import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";
import { listOrdersAdmin } from "@/lib/server/adminOrders";
import { handleRouteError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** GET /api/admin/orders?filter=attention  (store staff only) */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  try {
    const filter = new URL(request.url).searchParams.get("filter") || "all";
    return NextResponse.json(await listOrdersAdmin(filter), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error, "admin-orders");
  }
}
