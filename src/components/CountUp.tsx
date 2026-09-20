import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TextStyle, StyleProp } from "react-native";

/**
 * Counts a number up from 0 → `value` on mount (and whenever value changes).
 * RN twin of the web <CountUp>.
 */
export function CountUp({
  value,
  duration = 1200,
  style,
}: {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setN(v));
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, duration]);

  return <Text style={style}>{Math.round(n)}</Text>;
}
