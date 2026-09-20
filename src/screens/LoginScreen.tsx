import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "../supabase";
import { COUNTRIES, DEFAULT_COUNTRY, combineE164 } from "../countries";
import { theme } from "../theme";

export function LoginScreen() {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [dial, setDial] = useState(DEFAULT_COUNTRY.dial);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const e164 = combineE164(dial, phone);
    if (mode === "email" ? !email.trim() : !e164) {
      setError(mode === "email" ? "Enter your email and password." : "Enter your phone number and password.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    const creds =
      mode === "email"
        ? { email: email.trim(), password }
        : { phone: e164 as string, password };
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) {
      setError(error.message || "Sign in failed.");
      setLoading(false);
    }
    // On success, the auth listener in App.tsx takes over.
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🥤</Text>
        <Text style={styles.title}>Grab A Sip</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {mode === "phone" ? (
          <>
            <Text style={styles.label}>Country</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              {COUNTRIES.map((c) => {
                const active = c.dial === dial;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => setDial(c.dial)}
                    style={[styles.chip, active ? styles.chipActive : null]}
                  >
                    <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                      {c.flag} +{c.dial}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="98765 43210"
              placeholderTextColor={theme.dim}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.dim}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </>
        )}

        <TouchableOpacity
          onPress={() => {
            setMode(mode === "phone" ? "email" : "phone");
            setError(null);
          }}
          style={{ marginTop: 8 }}
        >
          <Text style={styles.toggle}>
            {mode === "phone" ? "Use email instead" : "Use phone instead"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={theme.dim}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.ink} />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Accounts are created by Grab A Sip. Contact us on WhatsApp for access.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: theme.ink, justifyContent: "center", padding: 20 },
  card: { backgroundColor: theme.surface, borderRadius: 24, borderWidth: 1, borderColor: theme.border, padding: 24 },
  logo: { fontSize: 40, textAlign: "center" },
  title: { color: theme.text, fontSize: 26, fontWeight: "800", textAlign: "center", marginTop: 8 },
  subtitle: { color: theme.muted, textAlign: "center", marginTop: 4, marginBottom: 16 },
  label: { color: theme.muted, fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  chipActive: { backgroundColor: theme.lime, borderColor: theme.lime },
  chipText: { color: theme.muted, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: theme.ink },
  toggle: { color: theme.lime, fontSize: 13, fontWeight: "600" },
  error: { color: theme.berry, marginTop: 12, fontSize: 14 },
  button: {
    backgroundColor: theme.lime,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: theme.ink, fontWeight: "700", fontSize: 16 },
  hint: { color: theme.dim, fontSize: 12, textAlign: "center", marginTop: 16 },
});
