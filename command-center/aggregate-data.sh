#!/usr/bin/env bash
# MoneyBot Command Center — data aggregator
# Pulls live metrics from existing MoneyBot/OpenClaw sources and writes
# command-center/dashboard-data.json for the TV dashboard.
#
# Usage:
#   bash command-center/aggregate-data.sh
#   bash command-center/aggregate-data.sh --serve   # also start python http.server

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DASH_DIR="$ROOT/command-center"
DATA_FILE="$DASH_DIR/dashboard-data.json"
MANUAL_FILE="$DASH_DIR/manual-metrics.json"
SCRIPTS="/Users/kahlilgarmon/MoneyBotClaw-1/scripts"
CRM_FILE="/Users/kahlilgarmon/.openclaw/workspace/crm/contacts.ndjson"
REPO="kgarmon99/moneybot-games"

mkdir -p "$DASH_DIR"

# Ensure manual override file exists with placeholders
if [[ ! -f "$MANUAL_FILE" ]]; then
  cat > "$MANUAL_FILE" <<'EOF'
{
  "appDownloads": 0,
  "testFlightUsers": 0,
  "activePilots": []
}
EOF
fi

# --- Helpers ---
run_json() {
  local name="$1"
  shift
  python3 - "$name" "$@" <<'PY'
import json, subprocess, sys
name = sys.argv[1]
cmd = sys.argv[2:]
try:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    print(json.dumps({
        "name": name,
        "ok": p.returncode == 0,
        "stdout": p.stdout,
        "stderr": p.stderr,
    }))
except Exception as exc:
    print(json.dumps({"name": name, "ok": False, "stdout": "", "stderr": str(exc)}))
PY
}

# --- 1. School pipeline from local CRM ---
school_pipeline_json="[]"
if [[ -f "$CRM_FILE" ]]; then
  school_pipeline_json="$(python3 - "$CRM_FILE" <<'PY'
import json, sys

def iter_objects(path):
    text = open(path).read()
    dec = json.JSONDecoder()
    idx = 0
    while idx < len(text):
        while idx < len(text) and text[idx] in ' \t\r\n':
            idx += 1
        if idx >= len(text):
            break
        try:
            obj, end = dec.raw_decode(text, idx)
            yield obj
            idx = end
        except json.JSONDecodeError:
            break

seen = set()
rows = []
for c in iter_objects(sys.argv[1]):
    labels = c.get("labels") or []
    if "school-district" not in labels:
        continue
    key = c.get("company") or c.get("school_district") or c.get("email")
    if not key or key in seen:
        continue
    seen.add(key)
    rows.append({
        "name": c.get("name") or key,
        "title": c.get("title") or "",
        "company": c.get("company") or c.get("school_district") or "",
        "stage": c.get("stage") or "new",
        "district": c.get("school_district") or "",
    })
print(json.dumps(rows))
PY
  )"
fi
school_count="$(echo "$school_pipeline_json" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"

# --- 2. Active pilots ---
# Use manual override list first; fall back to HubSpot deals with "pilot" in name.
active_pilots_json="$(python3 - "$MANUAL_FILE" "$CRM_FILE" <<'PY'
import json, sys

def iter_objects(path):
    text = open(path).read()
    dec = json.JSONDecoder()
    idx = 0
    while idx < len(text):
        while idx < len(text) and text[idx] in ' \t\r\n':
            idx += 1
        if idx >= len(text):
            break
        try:
            obj, end = dec.raw_decode(text, idx)
            yield obj
            idx = end
        except json.JSONDecodeError:
            break

manual = json.load(open(sys.argv[1]))
rows = manual.get("activePilots") or []
if rows:
    print(json.dumps(rows)); sys.exit(0)
# fallback: scan CRM notes for pilot language
seen = set()
for c in iter_objects(sys.argv[2]):
    notes = (c.get("notes") or "").lower()
    if "pilot" not in notes: continue
    key = c.get("company") or c.get("email")
    if not key or key in seen: continue
    seen.add(key)
    rows.append({
        "name": c.get("name") or key,
        "company": c.get("company") or c.get("school_district") or "",
        "stage": "pilot",
    })
print(json.dumps(rows))
PY
)"
pilot_count="$(echo "$active_pilots_json" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"

# --- 3. Revenue & cash from CFO snapshot ---
snapshot_run="$(run_json cfo-snapshot bash "$SCRIPTS/cfo/snapshot.sh" --json)"
snapshot_json="$(echo "$snapshot_run" | python3 -c 'import json,sys; r=json.load(sys.stdin); print(r["stdout"] if r["ok"] else "{}")')"

# --- 4. Investor pipeline from HubSpot deals ---
investor_run="$(run_json hubspot-deals bash "$SCRIPTS/connectors/hubspot/deals.sh" list --limit 100 --json)"
investor_json="$(python3 - "$investor_run" "$MANUAL_FILE" <<'PY'
import json, sys, re
run = json.loads(sys.argv[1])
manual = json.load(open(sys.argv[2]))
if not run.get("ok"):
    print(json.dumps({"count": 0, "weighted": 0, "unweighted": 0, "deals": []})); sys.exit(0)
data = json.loads(run.get("stdout") or "{}")
deals = []
investor_keywords = re.compile(r"foundation|investor|capital|fund|angel|vc|partners|holdings|group", re.I)
school_keywords = re.compile(r"school|district|academy|high school|hs|county|public|private|charter", re.I)
for d in data.get("results", []):
    p = d.get("properties", {})
    name = p.get("dealname", "")
    stage = p.get("dealstage", "")
    # skip closed and school deals for investor view
    if stage in ("closedwon", "closedlost"): continue
    if school_keywords.search(name): continue
    if not investor_keywords.search(name) and float(p.get("amount") or 0) < 5000:
        continue
    amt = float(p.get("amount") or 0)
    prob = float(p.get("hs_deal_stage_probability") or 0)
    deals.append({
        "name": name,
        "amount": amt,
        "probability": prob,
        "weighted": round(amt * prob, 2),
        "stage": stage,
    })
total_u = sum(d["amount"] for d in deals)
total_w = sum(d["weighted"] for d in deals)
print(json.dumps({
    "count": len(deals),
    "unweighted": round(total_u, 2),
    "weighted": round(total_w, 2),
    "deals": sorted(deals, key=lambda x: -x["weighted"])[:10],
}))
PY
)"

# --- 5. GitHub deployments ---
github_run="$(run_json github-deployments gh api "repos/$REPO/deployments" --jq '[.[:10] | .[] | {environment, ref, sha, created_at, updated_at}]')"
github_json="$(echo "$github_run" | python3 -c 'import json,sys; r=json.load(sys.stdin); print(r["stdout"] if r["ok"] else "[]")')"

# --- 6. Manual mobile metrics ---
mobile_json="$(python3 - "$MANUAL_FILE" <<'PY'
import json, sys
m = json.load(open(sys.argv[1]))
print(json.dumps({
    "appDownloads": int(m.get("appDownloads") or 0),
    "testFlightUsers": int(m.get("testFlightUsers") or 0),
}))
PY
)"

# --- 7. Attention items ---
attention_json="$(python3 - "$snapshot_json" "$school_pipeline_json" "$active_pilots_json" "$investor_json" <<'PY'
import json, sys
snap = json.loads(sys.argv[1])
schools = json.loads(sys.argv[2])
pilots = json.loads(sys.argv[3])
investors = json.loads(sys.argv[4])
items = []
# Cash/runway
runway = snap.get("runwayMonths")
if runway is not None and runway < 6:
    items.append({"level": "danger", "text": f"Runway below 6 months ({runway:.1f} mo)"})
# Schools pipeline empty
if len(schools) == 0:
    items.append({"level": "warning", "text": "School pipeline is empty"})
# Pilots empty
if len(pilots) == 0:
    items.append({"level": "warning", "text": "No active pilots tracked"})
# Investors empty
if investors.get("count", 0) == 0:
    items.append({"level": "info", "text": "Investor pipeline not yet populated"})
# Stale reconciliation
alerts = snap.get("alerts") or []
for a in alerts:
    if "Stale reconciliation" in a:
        items.append({"level": "warning", "text": a})
if not items:
    items.append({"level": "ok", "text": "Mission visible. No critical attention items."})
print(json.dumps(items))
PY
)"

# --- Write dashboard data ---
TMP_FILE="$DATA_FILE.tmp"
python3 - "$snapshot_json" "$school_count" "$school_pipeline_json" "$pilot_count" "$active_pilots_json" "$mobile_json" "$investor_json" "$github_json" "$attention_json" "$REPO" <<'PY' > "$TMP_FILE"
import json, sys, datetime as dt
snap = json.loads(sys.argv[1])
school_count = int(sys.argv[2])
schools = json.loads(sys.argv[3])
pilot_count = int(sys.argv[4])
pilots = json.loads(sys.argv[5])
mobile = json.loads(sys.argv[6])
investors = json.loads(sys.argv[7])
deployments = json.loads(sys.argv[8])
attention = json.loads(sys.argv[9])
repo = sys.argv[10]

cash = snap.get("cashTotal", 0)
mrr = snap.get("mrr", 0)
runway = snap.get("runwayMonths")

out = {
    "generatedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "repo": repo,
    "schools": {
        "count": school_count,
        "top": schools[:8],
    },
    "pilots": {
        "count": pilot_count,
        "top": pilots[:8],
    },
    "revenue": {
        "cash": cash,
        "mrr": mrr,
        "arr": snap.get("arr", mrr * 12),
        "runwayMonths": None if runway is None or runway >= 9999 else runway,
        "revenue30d": snap.get("grossRevenue30d", 0),
        "expenses30d": snap.get("grossBurn30d", 0),
        "netCashFlow30d": snap.get("netCashFlow30d", 0),
    },
    "mobile": mobile,
    "investors": investors,
    "deployments": deployments,
    "attention": attention,
}
print(json.dumps(out, indent=2))
PY

mv "$TMP_FILE" "$DATA_FILE"
echo "Command Center data refreshed: $DATA_FILE"

if [[ "${1:-}" == "--serve" ]]; then
  cd "$DASH_DIR"
  echo "Starting server on http://localhost:8765"
  exec python3 -m http.server 8765
fi
