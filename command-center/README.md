# MoneyBot Command Center

A wall-mounted-TV dashboard for MoneyBot. One glance tells you:

- How many schools are in the pipeline
- How many active pilots are running
- Cash, MRR, runway, 30-day revenue/burn
- App downloads & TestFlight users
- Investor pipeline (weighted/unweighted)
- Recent GitHub deployments
- What needs attention

## Run it

```bash
bash command-center/aggregate-data.sh   # refresh data
bash command-center/serve.sh            # start server
```

Then open `http://localhost:8765` on the TV/browser.

## Data sources

| Panel | Source |
|-------|--------|
| School pipeline | `~/.openclaw/workspace/crm/contacts.ndjson` (labels: `school-district`) |
| Active pilots | `manual-metrics.json` → fallback scans CRM notes for "pilot" |
| Revenue/Runway | `scripts/cfo/snapshot.sh --json` |
| App downloads | `manual-metrics.json` (placeholder until App Store Connect API) |
| TestFlight users | `manual-metrics.json` (placeholder until App Store Connect API) |
| Investor pipeline | HubSpot deals filtered for investor/foundation language |
| GitHub deployments | `gh api repos/kgarmon99/moneybot-games/deployments` |

## Update manual metrics

Edit `command-center/manual-metrics.json`:

```json
{
  "appDownloads": 0,
  "testFlightUsers": 0,
  "activePilots": [
    {"name": "Fayette County", "company": "Fayette County Public Schools", "stage": "pilot"}
  ]
}
```

## Auto-refresh

The dashboard fetches `dashboard-data.json` every 60 seconds. Run `aggregate-data.sh` on a cron to keep it live:

```cron
*/5 * * * * bash /Users/kahlilgarmon/.openclaw/workspace-moneybot-code/command-center/aggregate-data.sh
```

## Files

- `aggregate-data.sh` — pulls live data, writes `dashboard-data.json`
- `index.html` — TV dashboard
- `serve.sh` — local HTTP server
- `manual-metrics.json` — editable overrides for metrics not yet API-connected
