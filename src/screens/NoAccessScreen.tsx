import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase";
import { theme } from "../theme";

export function NoAccessScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={{ fontSize: 40 }}>⏳</Text>
      <Text style={styles.title}>Account not set up yet</Text>
      <Text style={styles.body}>
        Your login isn&apos;t linked to a rider or customer profile yet. Please
        contact Grab A Sip on WhatsApp and we&apos;ll sort it out.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.ink, alignItems: "center", justifyContent: "center", padding: 28 },
  title: { color: theme.text, fontSize: 22, fontWeight: "800", marginTop: 12, textAlign: "center" },
  body: { color: theme.muted, textAlign: "center", marginTop: 8, lineHeight: 21 },
  button: { borderWidth: 1, borderColor: theme.border, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, marginTop: 24 },
  buttonText: { color: theme.text, fontWeight: "600" },
});
