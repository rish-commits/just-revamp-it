/**
 * A worked page, in the narrative order every scan page follows:
 *
 *   H1 -> dek (the question, and the population) -> hero row -> KPI strip
 *   -> sections -> definitions
 *
 * Copy this, replace the data, delete what you do not need. The point is the
 * ORDER and the annotations, not the metrics.
 */
import { Card, HeroStat, KpiTile, FunnelBars, LineTrend, EmptyState } from "../components";
import type { FunnelStep } from "../components";

const LOCALE = "en-GB";
const TZ = "Europe/London";

// One canonical wording per metric, imported everywhere it is mentioned, so the
// tooltip and the glossary can never disagree (reference/trust.md).
const DEF = {
  active: "A signed-in account that took at least one deliberate action in the period. Excludes automated jobs, imported records and seeded data.",
  population: "All figures count onboarded accounts, not every row in the database.",
};

const funnel: FunnelStep[] = [
  { label: "Visited",   value: 12480, note: "Sessions · analytics · device-level", soft: true },
  { label: "Signed up", value: 3120,  note: "Accounts created" },
  { label: "Activated", value: 1870,  note: "Completed setup" },
  { label: "Returned",  value: 940,   note: "Acted again on a later day · distinct people" },
];

export default function ExampleDashboard() {
  const trend = [420, 455, 470, 462, 501, 530, 548, 572];
  const labels = ["01 Sep", "02 Sep", "03 Sep", "04 Sep", "05 Sep", "06 Sep", "07 Sep", "08 Sep"];

  return (
    <main className="jr-page">
      <h1 className="jr-title">Pulse</h1>
      {/* The dek states the question the page answers, and the population. */}
      <p className="jr-dek">
        Is the product healthy this week? {DEF.population} Updated {new Date().toLocaleString(LOCALE, { timeZone: TZ })} ({TZ}).
      </p>

      {/* Hero row: the verdict first. */}
      <div className="jr-grid jr-grid--hero">
        <HeroStat
          label="North star · Weekly active accounts"
          value={(572).toLocaleString(LOCALE)}
          deltaPct={7}
          deltaAbs={38}
          spark={trend}
          comparison="vs prev 7d"
          caption="Onboarded accounts with at least one deliberate action in the last 7 days."
        />
        <div className="jr-span-2">
          <Card
            title="Where people fall out"
            subtitle="Visit to return · last 28 days · Europe/London"
            info={`Bars are share of the first step. The biggest true user-level drop is flagged in red. Visited is device-level and marked approximate, so it is never flagged. ${DEF.active}`}
          >
            <FunnelBars steps={funnel} />
          </Card>
        </div>
      </div>

      {/* KPI strip: what the hero does not already say. */}
      <div className="jr-grid jr-grid--strip jr-continue">
        <KpiTile label="Signups · 28d" value={(3120).toLocaleString(LOCALE)} deltaPct={12}
          compare={{ label: "prev 28d", value: (2786).toLocaleString(LOCALE) }}
          info="Accounts created in the period." />
        <KpiTile label="Activation rate" value="60%" deltaPct={-3} goodWhenUp
          hint="1,870 of 3,120 signups" info="Share of signups that completed setup." />
        {/* Down is good here, so polarity is declared. */}
        <KpiTile label="Time to activate" value="2.4 days" deltaPct={-8} goodWhenUp={false}
          hint="Median across activated accounts" info="Median hours from signup to completed setup." />
        {/* Declared even with no delta yet: polarity belongs to the metric. */}
        <KpiTile label="Support contacts" value="41" goodWhenUp={false}
          hint="No comparison period yet" info="Tickets opened by accounts in their first week." />
      </div>

      <div className="jr-grid jr-grid--pair jr-section">
        <Card title="Is activity growing?" subtitle="Daily active accounts · Europe/London"
          info={`Daily count of accounts taking a deliberate action. ${DEF.active}`}>
          <LineTrend series={[{ label: "Daily active", values: trend }]} labels={labels} />
        </Card>
        <Card title="Retention by cohort" subtitle="Weekly cohorts · last 8 weeks">
          {/* Own the empty state inside the card, in domain language. */}
          <EmptyState>Not enough history yet. Cohort retention appears once four weeks have closed.</EmptyState>
        </Card>
      </div>

      {/* Definitions last, because the numbers above depend on them. */}
      <div className="jr-section">
        <Card title="How these numbers are defined"
          subtitle="One definition, used by every figure on this page">
          <dl style={{ display: "grid", gap: 12, margin: 0 }}>
            <div>
              <dt style={{ fontSize: "var(--text-label)", fontWeight: 600 }}>Active</dt>
              <dd style={{ margin: "2px 0 0", fontSize: "var(--text-caption)", color: "var(--muted)" }}>{DEF.active}</dd>
            </div>
            <div>
              <dt style={{ fontSize: "var(--text-label)", fontWeight: 600 }}>Population</dt>
              <dd style={{ margin: "2px 0 0", fontSize: "var(--text-caption)", color: "var(--muted)" }}>{DEF.population}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </main>
  );
}
