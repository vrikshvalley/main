"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";
import { money, when } from "./format";

const TABS = [
  ["all", "All"],
  ["attention", "Needs attention"],
  ["paid", "Paid"],
  ["shipment_failed", "Shipment failed"],
  ["service", "Plant Doctor"],
  ["returns", "Returns"],
];

export default function OrdersList() {
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await authFetch(`/api/admin/orders?filter=${filter}`);
      const json = await res.json();
      if (!res.ok) throw new Error(res.status === 403 ? "This account is not staff. Ask the owner to add it to ADMIN_EMAILS." : json?.error?.message || "Could not load orders");
      setData(json);
    } catch (e) {
      setData(null);
      setError(e.message);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="adm-error adm-center">{error}</p>;

  return (
    <section>
      <div className="adm-head">
        <h1>Orders</h1>
        <button className="adm-btn" onClick={load}>Refresh</button>
      </div>
      <nav className="adm-tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={filter === key ? "is-on" : ""} onClick={() => setFilter(key)}>
            {label}
            {data?.counts?.[key] > 0 && <b>{data.counts[key]}</b>}
          </button>
        ))}
      </nav>
      {!data ? (
        <p className="adm-center">Loading…</p>
      ) : data.rows.length === 0 ? (
        <p className="adm-center">Nothing here.</p>
      ) : (
        <div className="adm-table">
          {data.rows.map((o) => (
            <Link key={o.order_id} href={`/admin/orders/${encodeURIComponent(o.order_id)}`} className={`adm-row ${o.needs_attention ? "is-flag" : ""}`}>
              <span className="adm-row__id">{o.order_id}<small>{when(o.order_date)}</small></span>
              <span>{o.customer_name || "-"}<small>{o.kind === "service" ? `Plant Doctor · ${o.appointment?.date || ""} ${o.appointment?.time || ""}` : `${o.item_count} item(s)`}</small></span>
              <span>
                <i className={`adm-pill st-${o.status}`}>{o.status}</i>
                <i className={`adm-pill pay-${o.payment_status}`}>{o.payment_status}</i>
                {o.shipment_status && <i className={`adm-pill ship-${o.shipment_status}`}>{o.shipment_status}</i>}
              </span>
              <span className="adm-row__total">{money(o.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
