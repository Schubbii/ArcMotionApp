import { Alert, Platform } from "react-native";

export interface DialogAction {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

/**
 * Cross-platform confirm dialog. Uses the native Alert on iOS/Android; on web
 * (where react-native-web's Alert is a silent no-op) it falls back to
 * window.confirm, treating the last non-cancel action as the primary choice.
 */
export function showDialog(title: string, message: string, actions: DialogAction[] = []): void {
  if (Platform.OS !== "web") {
    // An empty button array renders an Android dialog with NO buttons that
    // can never be dismissed — always provide at least an OK. cancelable lets
    // back/outside taps close it (dismissing without a choice = cancel).
    const buttons = actions.length > 0 ? actions : [{ text: "OK" }];
    Alert.alert(title, message, buttons, { cancelable: true });
    return;
  }
  const primary = [...actions].reverse().find((a) => a.style !== "cancel");
  const cancel = actions.find((a) => a.style === "cancel");
  if (!primary) {
    // Informational only.
    window.alert(`${title}\n\n${message}`);
    actions[0]?.onPress?.();
    return;
  }
  const ok = window.confirm(`${title}\n\n${message}\n\n[OK = ${primary.text}]`);
  if (ok) primary.onPress?.();
  else cancel?.onPress?.();
}
