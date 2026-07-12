import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { usePro } from "../context/ProContext";
import { Card, PrimaryButton } from "../components/ui";
import { PressableScale } from "../components/motion";
import { CheckIcon, CloseIcon, CrownIcon } from "../components/Icons";
import { showDialog } from "../lib/dialogs";
import { annualSavingsPercent, PRO_FEATURES } from "../lib/entitlements";
import type { SubPackage } from "../lib/purchases.types";

/**
 * The subscription paywall. Lists what Pro unlocks, offers a monthly / annual
 * plan and runs the buy + restore flows through usePro(). Prices come from the
 * store (or the mock) so they're always localized and correct.
 */
export function PaywallScreen({ onClose }: { onClose: () => void }) {
  const t = useTheme();
  const { isPro, packages, mode, purchasing, restoring, purchase, restore } = usePro();

  // Annual first (it's the value pick and the default selection).
  const sorted = useMemo(
    () => [...packages].sort((a, b) => (a.period === "annual" ? -1 : 1)),
    [packages]
  );
  const [selected, setSelected] = useState<string | null>(null);
  const activeId = selected ?? sorted[0]?.id ?? null;

  const monthly = packages.find((p) => p.period === "monthly");
  const annual = packages.find((p) => p.period === "annual");
  const savings =
    monthly && annual ? annualSavingsPercent(monthly.priceAmount, annual.priceAmount) : 0;

  const onSubscribe = async () => {
    if (!activeId) return;
    const res = await purchase(activeId);
    if (res.ok) {
      showDialog("You're Pro! 🎉", "Every theme and the calendar overview are unlocked. Thank you for supporting ArcMotion.");
      onClose();
    } else if (!res.cancelled) {
      showDialog("Purchase failed", res.error ?? "Something went wrong. Please try again.");
    }
  };

  const onRestore = async () => {
    const res = await restore();
    if (res.ok) {
      showDialog("Purchases restored", "Your Pro subscription is active again.");
      onClose();
    } else {
      showDialog("Nothing to restore", res.error ?? "No previous purchase was found for this store account.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.closeRow}>
        <PressableScale onPress={onClose} style={[styles.closeBtn, { backgroundColor: t.glassSurface, borderColor: t.glassBorder }]}>
          <CloseIcon size={20} color={t.text} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.crown, { backgroundColor: t.primarySoft }]}>
            <CrownIcon size={30} color={t.primary} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>ArcMotion Pro</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            Unlock the full experience. Cancel anytime.
          </Text>
        </View>

        <Card style={{ marginTop: 4 }}>
          {PRO_FEATURES.map((f, i) => (
            <View
              key={f.id}
              style={[styles.feature, i > 0 && { borderTopWidth: 1, borderTopColor: t.border }]}
            >
              <View style={[styles.tick, { backgroundColor: t.primary }]}>
                <CheckIcon size={13} color={t.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: "800", fontSize: 15 }}>{f.title}</Text>
                <Text style={{ color: t.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 }}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Card>

        {isPro ? (
          <Card style={{ marginTop: 16, alignItems: "center", gap: 6 }}>
            <Text style={{ color: t.primary, fontWeight: "900", fontSize: 16 }}>Pro is active ✓</Text>
            <Text style={{ color: t.textMuted, fontSize: 13, textAlign: "center", lineHeight: 18 }}>
              You already have everything unlocked. Manage your subscription in your store account.
            </Text>
          </Card>
        ) : sorted.length === 0 ? (
          <Card style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={{ color: t.textMuted, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
              Subscriptions aren't available right now. Please try again in a moment.
            </Text>
          </Card>
        ) : (
          <>
            <View style={{ marginTop: 18, gap: 12 }}>
              {sorted.map((p) => (
                <PlanCard
                  key={p.id}
                  pkg={p}
                  selected={p.id === activeId}
                  badge={p.period === "annual" && savings > 0 ? `SAVE ${savings}%` : undefined}
                  onPress={() => setSelected(p.id)}
                />
              ))}
            </View>

            <PrimaryButton
              title={purchasing ? "Processing…" : trialTitle(sorted.find((p) => p.id === activeId))}
              onPress={onSubscribe}
              style={{ marginTop: 18 }}
            />

            <TouchableOpacity onPress={onRestore} disabled={restoring} style={{ paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: t.textMuted, fontWeight: "700", fontSize: 14 }}>
                {restoring ? "Restoring…" : "Restore purchases"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {mode === "mock" && (
          <Text style={[styles.fine, { color: t.textFaint }]}>
            Test mode — no real payment is taken. Add your RevenueCat keys to enable live purchases.
          </Text>
        )}
        <Text style={[styles.fine, { color: t.textFaint }]}>
          Subscriptions renew automatically unless cancelled at least 24 hours before the period ends.
          Manage or cancel anytime in your store account. Terms of Use · Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

/** Button label — leads with the free trial when the plan offers one. */
function trialTitle(pkg?: SubPackage): string {
  if (!pkg) return "Continue";
  if (pkg.hasTrial) return "Start free trial";
  return pkg.period === "annual" ? "Subscribe yearly" : "Subscribe monthly";
}

function PlanCard({
  pkg,
  selected,
  badge,
  onPress,
}: {
  pkg: SubPackage;
  selected: boolean;
  badge?: string;
  onPress: () => void;
}) {
  const t = useTheme();
  const period = pkg.period === "annual" ? "per year" : "per month";
  return (
    <PressableScale
      scaleTo={0.98}
      onPress={onPress}
      style={[
        styles.plan,
        { backgroundColor: t.surface, borderColor: selected ? t.primary : t.border },
        selected && { borderWidth: 2 },
      ]}
    >
      <View style={[styles.radio, { borderColor: selected ? t.primary : t.textFaint }]}>
        {selected && <View style={[styles.radioDot, { backgroundColor: t.primary }]} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.text, fontWeight: "800", fontSize: 15.5 }}>
          {pkg.period === "annual" ? "Yearly" : "Monthly"}
        </Text>
        <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 2 }}>
          {pkg.priceString} {period}
          {pkg.trialLabel ? ` · ${pkg.trialLabel}` : ""}
        </Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: t.primary }]}>
          <Text style={{ color: t.onPrimary, fontWeight: "900", fontSize: 11 }}>{badge}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  closeRow: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingTop: 8 },
  closeBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hero: { alignItems: "center", paddingTop: 4, paddingBottom: 16 },
  crown: { width: 68, height: 68, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 14.5, marginTop: 6, textAlign: "center", lineHeight: 20 },
  feature: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  tick: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  plan: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  fine: { fontSize: 11.5, lineHeight: 17, textAlign: "center", marginTop: 16 },
});
