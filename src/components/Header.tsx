import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase";
import { theme } from "../theme";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 22 }}>🥤</Text>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <TouchableOpacity style={styles.signout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.signoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: { color: theme.text, fontSize: 15, fontWeight: "800" },
  subtitle: { color: theme.muted, fontSize: 12 },
  signout: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  signoutText: { color: theme.text, fontSize: 13, fontWeight: "600" },
});
