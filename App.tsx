import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./src/supabase";
import { apiJson } from "./src/api";
import { theme } from "./src/theme";
import { LoginScreen } from "./src/screens/LoginScreen";
import { CustomerScreen } from "./src/screens/CustomerScreen";
import { RiderScreen } from "./src/screens/RiderScreen";
import { NoAccessScreen } from "./src/screens/NoAccessScreen";

type Me = { provisioned: boolean; role: string | null };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null | undefined>(undefined); // undefined = loading
  const [authReady, setAuthReady] = useState(false);

  // Track the Supabase session.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setRole(undefined);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Resolve role whenever we have a session.
  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setRole(null);
      return;
    }
    apiJson<Me>("/api/me").then((me) => {
      if (!cancelled) setRole(me?.role ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!authReady) return <Splash />;
  if (!session) return <Screen><LoginScreen /></Screen>;
  if (role === undefined) return <Splash />;

  return (
    <Screen>
      {role === "rider" ? (
        <RiderScreen />
      ) : role === "customer" ? (
        <CustomerScreen />
      ) : (
        <NoAccessScreen />
      )}
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {children}
    </View>
  );
}

function Splash() {
  return (
    <View style={[styles.root, styles.center]}>
      <StatusBar style="light" />
      <ActivityIndicator color={theme.lime} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.ink },
  center: { alignItems: "center", justifyContent: "center" },
});
