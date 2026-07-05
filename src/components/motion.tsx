import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the element shrinks while pressed. */
  scaleTo?: number;
}

/**
 * Drop-in replacement for TouchableOpacity that springs down slightly while
 * pressed and pops back on release — the "premium" button feel. Runs on the
 * native driver, so it stays smooth even while JS is busy.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = (toValue: number, bouncy: boolean) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: bouncy ? 7 : 0,
    }).start();

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        press(scaleTo, false);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        press(1, true);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

interface FadeSlideInProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Initial vertical offset the content slides up from. */
  offset?: number;
}

/**
 * Fades + slides its children in on mount. Give it a `key` that changes with
 * the route/tab and every navigation gets a soft entrance transition.
 */
export function FadeSlideIn({ children, style, offset = 14 }: FadeSlideInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 190, useNativeDriver: true }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 22,
        bounciness: 5,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[{ flex: 1, opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
