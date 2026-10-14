import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { theme } from "@/constants/theme";

export type AccessAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
};

type AccessMessageProps = {
  eyebrow?: string;
  title: string;
  body: string;
  hint?: string;
  loading?: boolean;
  error?: string | null;
  actions?: AccessAction[];
};

export function AccessMessage({
  eyebrow = "Captura",
  title,
  body,
  hint,
  loading = false,
  error,
  actions = [],
}: AccessMessageProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.mark} accessibilityElementsHidden>
          <View style={styles.markOuter} />
          <View style={styles.markInner}>
            {loading ? <ActivityIndicator color={theme.colors.accent} /> : <View style={styles.markCore} />}
          </View>
        </View>

        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        {hint ? (
          <View style={styles.hint}>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {actions.length > 0 ? (
          <View style={styles.actions}>
            {actions.map((action) => (
              <AppButton
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                variant={action.variant}
              />
            ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  mark: {
    width: 88,
    height: 88,
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  markOuter: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    opacity: 0.45,
  },
  markInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  markCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accent,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  hint: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  hintText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.dangerSurface,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
});
