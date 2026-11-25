import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirect } from "../lib/safeRedirect.js";
import { jsonLd } from "../lib/jsonLd.js";
import { returnWindowStatus } from "../lib/payments/returns.js";

test("only same-site paths are accepted as a post-login redirect", () => {
  assert.equal(safeRedirect("/checkout"), "/checkout");
  assert.equal(safeRedirect("/orders?tab=1#x"), "/orders?tab=1#x");
  const backslash = String.fromCharCode(92);
  const crlf = String.fromCharCode(13, 10);
  for (const bad of ["https://evil.example", "//evil.example", "/" + backslash + "evil.example", "javascript:alert(1)", "evil.example", "", null, undefined, 42, "/ok" + crlf + "Set-Cookie: x=1"]) {
    assert.equal(safeRedirect(bad, "/profile"), "/profile", String(bad));
  }
});

test("JSON-LD cannot break out of its script tag", () => {
  const out = jsonLd({ name: 'Fern </script><script>alert(1)</script> & co', note: "a b" });
  assert.ok(!out.includes("</script>"));
  assert.ok(!out.includes("<"));
  assert.deepEqual(JSON.parse(out), { name: 'Fern </script><script>alert(1)</script> & co', note: "a b" });
});

test("returns are open for 7 days after delivery, per the published policy", () => {
  const delivered = "2026-11-20T10:00:00.000Z";
  assert.equal(returnWindowStatus({ delivered_date: delivered }, new Date("2026-11-26T10:00:00.000Z")).open, true);
  assert.equal(returnWindowStatus({ delivered_date: delivered }, new Date("2026-11-28T10:00:00.000Z")).open, false);
  // no courier delivery date: the team verifies, so the request is accepted
  const unknown = returnWindowStatus({}, new Date());
  assert.equal(unknown.open, true);
  assert.equal(unknown.verified, false);
});
