import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native";
import { Header } from "../components/Header";
import { JuiceGlass } from "../components/JuiceGlass";
import { apiJson } from "../api";
import { theme, planColors, MONTHLY_BOXES } from "../theme";

type Sub = { id: string; planName: string; price: number; status: string; pauseDaysUsed: number };
type Delivery = { id: string; date: string; status: string };
type Summary = {
  activeSubscriptions: number;
  deliveredThisMonth: number;
  nextDeliveryDate: string | null;
};

const pill = (status: string) => {
  const map: Record<string, string> = {
    active: theme.lime,
    paused: theme.mango,
    cancelled: theme.dim,
    delivered: theme.lime,
    pending: theme.muted,
    dispatched: theme.mango,
    failed: theme.berry,
  };
  return map[status] ?? theme.muted;
};

export function CustomerScreen() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, su, d] = await Promise.all([
      apiJson<Summary>("/api/customer/summary"),
      apiJson<Sub[]>("/api/customer/subscriptions"),
      apiJson<Delivery[]>("/api/customer/deliveries"),
    ]);
    if (s) setSummary(s);
    setSubs(su ?? []);
    setDeliveries(d ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const upcoming = deliveries.filter((d) => d.status === "pending" || d.status === "dispatched");
  const recent = deliveries
    .filter((d) => d.status === "delivered" || d.status === "failed")
    .slice(0, 8);

  const delivered = summary?.deliveredThisMonth ?? 0;
  const monthPct = Math.min(100, Math.round((delivered / MONTHLY_BOXES) * 100));
  const activeSubs = subs.filter((s) => s.status === "active");
  const hero = planColors(activeSubs[0]?.planName ?? subs[0]?.planName);

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Grab A Sip" subtitle="Your deliveries" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.muted} />}
      >
        {/* Hero: this month's glass filling up */}
        <View style={styles.hero}>
          <JuiceGlass pct={monthPct} color={hero.fill} garnish={hero.garnish} size={116} showPct />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>YOUR MONTH, FILLING UP</Text>
            <Text style={styles.heroNum}>
              {delivered}
              <Text style={styles.heroNumMuted}> / {MONTHLY_BOXES} boxes</Text>
            </Text>
            <Text style={styles.heroCopy}>
              {monthPct >= 100
                ? "Full glass! A complete month of freshness. 🎉"
                : `${MONTHLY_BOXES - delivered} more sips to a full month.`}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Stat n={summary?.activeSubscriptions ?? 0} l="Plans" color={theme.lime} />
          <Stat n={summary?.deliveredThisMonth ?? 0} l="This month" />
          <Stat text={summary?.nextDeliveryDate ?? "—"} l="Next drop" color={theme.aqua} />
        </View>

        <Text style={styles.h2}>Your subscriptions</Text>
        {subs.length === 0 ? (
          <Empty text="No subscriptions yet." />
        ) : (
          subs.map((s) => {
            const c = planColors(s.planName);
            const subPct = s.status === "cancelled" ? 0 : monthPct;
            return (
              <View key={s.id} style={styles.card}>
                <JuiceGlass pct={subPct} color={c.fill} garnish={c.garnish} size={48} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{s.planName}</Text>
                  <Text style={styles.cardSub}>
                    ₹{s.price.toLocaleString("en-IN")}/mo · pauses {s.pauseDaysUsed}/5
                  </Text>
                </View>
                <Badge status={s.status} />
              </View>
            );
          })
        )}

        {upcoming.length > 0 && (
          <>
            <Text style={styles.h2}>Upcoming</Text>
            {upcoming.map((d) => (
              <View key={d.id} style={styles.row}>
                <Text style={styles.rowText}>{d.date}</Text>
                <Badge status={d.status} />
              </View>
            ))}
          </>
        )}

        <Text style={styles.h2}>Recent deliveries</Text>
        {recent.length === 0 ? (
          <Empty text="Nothing yet." />
        ) : (
          recent.map((d) => (
            <View key={d.id} style={styles.row}>
              <Text style={styles.rowMuted}>{d.date}</Text>
              <Badge status={d.status} />
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, text, l, color }: { n?: number; text?: string; l: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statN, color ? { color } : null]}>{text ?? n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}
function Badge({ status }: { status: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: pill(status) + "26" }]}>
      <Text style={[styles.badgeText, { color: pill(status) }]}>{status}</Text>
    </View>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSub}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.ink, paddingTop: 44 },
  content: { padding: 20 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 14,
  },
  heroKicker: { color: theme.muted, fontSize: 10, letterSpacing: 1, fontWeight: "700" },
  heroNum: { color: theme.text, fontSize: 26, fontWeight: "800", marginTop: 4 },
  heroNumMuted: { color: theme.muted, fontSize: 15, fontWeight: "700" },
  heroCopy: { color: theme.muted, fontSize: 12, marginTop: 6, lineHeight: 17 },
  statRow: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, backgroundColor: theme.surface, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 14, alignItems: "center" },
  statN: { color: theme.text, fontSize: 20, fontWeight: "800" },
  statL: { color: theme.muted, fontSize: 10, textTransform: "uppercase", marginTop: 4, letterSpacing: 1 },
  h2: { color: theme.text, fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: theme.surface, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 10 },
  cardTitle: { color: theme.text, fontWeight: "700", fontSize: 15 },
  cardSub: { color: theme.muted, fontSize: 13, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  rowText: { color: theme.text, fontWeight: "600" },
  rowMuted: { color: theme.muted },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
});
