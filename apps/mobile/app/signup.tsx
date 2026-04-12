import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GradientColors, DarkTheme } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace("/welcome");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create account";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[...GradientColors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name="person-add" size={32} color="#FFF" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Get started in just a minute</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Name */}
        <Text style={styles.label}>Full name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={20}
            color={DarkTheme.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Jane Doe"
            placeholderTextColor={DarkTheme.textMuted}
            autoCapitalize="words"
            autoComplete="name"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={DarkTheme.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={DarkTheme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={DarkTheme.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={DarkTheme.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={DarkTheme.textMuted}
            style={styles.inputIconRight}
            onPress={() => setShowPassword((v) => !v)}
            suppressHighlighting
          />
        </View>

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={DarkTheme.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={DarkTheme.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Create account button */}
        <View style={styles.buttonContainer}>
          <Pressable onPress={handleSignup} disabled={loading} style={styles.submitTouchable}>
            <LinearGradient
              colors={[...GradientColors]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Create account</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <Text style={styles.footerLink}>Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function friendlyError(msg: string): string {
  if (msg.includes("email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (msg.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("network-request-failed")) {
    return "Network error. Check your connection.";
  }
  return msg;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: DarkTheme.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: DarkTheme.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#FF6B6B",
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: DarkTheme.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DarkTheme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DarkTheme.border,
    marginBottom: 16,
  },
  inputIcon: {
    marginLeft: 14,
  },
  inputIconRight: {
    marginRight: 14,
    padding: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: DarkTheme.text,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  submitTouchable: {
    borderRadius: 28,
    overflow: "hidden",
  },
  submitGradient: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
    color: DarkTheme.textSecondary,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "600",
    color: GradientColors[0],
  },
});
