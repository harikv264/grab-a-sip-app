import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  SafeAreaView,
} from "react-native";
import { Header } from "../components/Header";
import { JuiceGlass } from "../components/JuiceGlass";
import { api, apiJson } from "../api";
import { theme } from "../theme";

type Delivery = {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  addressText: string | null;
  planName: string | null;
  status: string;
};
type Stats = {
  deliveredToday: number;
  deliveredThisWeek: number;
  deliveredThisMonth: number;
};

const NEXT: Record<string, { label: string; status: string; color: string }[]> = {
  pending: [{ label: "Dispatch", status: "dispatched", color: theme.mango }],
  dispatched: [
    { label: "Delivered", status: "delivered", color: theme.lime },
    { label: "Failed", status: "failed", color: theme.berry },
  ],
  delivered: [],
  failed: [{ label: "Retry", status: "dispatched", color: theme.mango }],
};

export function RiderScreen() {
  const [rows, setRows] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [d, s] = await Promise.all([
      apiJson<Delivery[]>("/api/rider/deliveries"),
      apiJson<Stats>("/api/rider/stats"),
    ]);
    setRows(d ?? []);
    if (s) setStats(s);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const setStatus = async (row: Delivery, status: string) => {
    setBusy(row.id);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)));
    try {
      await api(`/api/rider/deliveries/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    } finally {
      setBusy(null);
    }
  };

  const routeDone = rows.filter((r) => r.status === "delivered").length;
  const routeTotal = rows.length;
  const routePct = routeTotal > 0 ? Math.round((routeDone / routeTotal) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Rider" subtitle="Your deliveries" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.muted} />}
      >
        <View style={styles.hero}>
          <JuiceGlass pct={routePct} color={theme.lime} garnish={theme.aqua} size={100} showPct />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>TODAY&apos;S ROUTE</Text>
            <Text style={styles.heroNum}>
              {routeDone}
              <Text style={styles.heroNumMuted}> / {routeTotal} done</Text>
            </Text>
            <Text style={styles.heroCopy}>
              {routeTotal === 0
                ? "No stops assigned yet today."
                : routePct >= 100
                ? "Route complete — glass full! 🎉"
                : "Your glass fills with every drop you complete."}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Stat n={stats?.deliveredToday ?? 0} l="Today" color={theme.lime} />
          <Stat n={stats?.deliveredThisWeek ?? 0} l="This week" />
          <Stat n={stats?.deliveredThisMonth ?? 0} l="This month" />
        </View>

        <Text style={styles.h2}>Today&apos;s route</Text>
        {rows.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardSub}>No deliveries assigned for today. 🎉</Text>
          </View>
        ) : (
          rows.map((r) => (
            <View key={r.id} style={[styles.card, busy === r.id ? { opacity: 0.6 } : null]}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{r.customerName}</Text>
                <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Text style={styles.badgeText}>{r.status}</Text>
                </View>
              </View>
              {r.customerPhone ? (
                <Text style={styles.phone} onPress={() => Linking.openURL(`tel:${r.customerPhone}`)}>
                  📞 {r.customerPhone}
                </Text>
              ) : null}
              <Text style={styles.address}>{r.addressText || "—"}</Text>
              <Text style={styles.plan}>{r.planName}</Text>
              <View style={styles.actions}>
                {(NEXT[r.status] ?? []).map((a) => (
                  <TouchableOpacity
                    key={a.status + a.label}
                    style={[styles.action, { backgroundColor: a.color + "26" }]}
                    onPress={() => setStatus(r, a.status)}
                  >
                    <Text style={[styles.actionText, { color: a.color }]}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
                {r.status === "delivered" ? (
                  <Text style={{ color: theme.lime, fontWeight: "700" }}>Done ✓</Text>
                ) : null}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, l, color }: { n: number; l: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statN, color ? { color } : null]}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
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
  statN: { color: theme.text, fontSize: 22, fontWeight: "800" },
  statL: { color: theme.muted, fontSize: 10, textTransform: "uppercase", marginTop: 4, letterSpacing: 1 },
  h2: { color: theme.text, fontSize: 17, fontWeight: "800", marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: theme.surface, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 16, marginBottom: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: theme.text, fontWeight: "700", fontSize: 16 },
  cardSub: { color: theme.muted, fontSize: 14 },
  phone: { color: theme.lime, marginTop: 6, fontSize: 14 },
  address: { color: theme.muted, marginTop: 6, fontSize: 14 },
  plan: { color: theme.dim, marginTop: 2, fontSize: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" },
  action: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  actionText: { fontWeight: "700", fontSize: 14 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: theme.text, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
});
