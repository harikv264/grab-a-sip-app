import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  G,
  Line,
  Circle,
  Text as SvgText,
} from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);

const WAVE =
  "M-20,22 Q0,17 20,22 T60,22 T100,22 T140,22 T180,22 T220,22 T260,22 L260,152 L-20,152 Z";
const INTERIOR = "M25,18 L95,18 L86,145 Q85,149 81,149 L39,149 Q35,149 34,145 Z";
const FILL_RANGE = 131; // 18 → 149

let uid = 0;

/**
 * The signature Grab A Sip glass — fills with juice to `pct` (0–100),
 * plan-coloured, with an animated wavy surface, a straw and a fruit garnish.
 * React Native / react-native-svg twin of the web <JuiceGlass>.
 */
export function JuiceGlass({
  pct,
  color,
  garnish = "#FF6B2C",
  size = 120,
  showPct = false,
}: {
  pct: number;
  color: string;
  garnish?: string;
  size?: number;
  showPct?: boolean;
}) {
  const id = useRef(`jg${uid++}`).current;
  const target = Math.max(0, Math.min(100, pct));
  const fill = useRef(new Animated.Value(0)).current; // 0..100
  const wave = useRef(new Animated.Value(0)).current; // 0..1

  useEffect(() => {
    Animated.timing(fill, {
      toValue: target,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [target]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = fill.interpolate({
    inputRange: [0, 100],
    outputRange: [FILL_RANGE, 0],
  });
  const translateX = wave.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  return (
    <Svg width={size} height={size * (160 / 120)} viewBox="0 0 120 160">
      <Defs>
        <LinearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.98" />
          <Stop offset="1" stopColor={color} stopOpacity="0.72" />
        </LinearGradient>
        <ClipPath id={`c-${id}`}>
          <Path d={INTERIOR} />
        </ClipPath>
      </Defs>

      {/* empty-glass tint */}
      <Path d={INTERIOR} fill="rgba(255,255,255,0.035)" />

      {/* liquid */}
      <G clipPath={`url(#c-${id})`}>
        <AnimatedG translateY={translateY}>
          <AnimatedG translateX={translateX}>
            <Path d={WAVE} fill={`url(#g-${id})`} opacity={0.5} />
          </AnimatedG>
          <AnimatedG translateX={translateX}>
            <Path d={WAVE} fill={`url(#g-${id})`} />
          </AnimatedG>
          <Circle cx="48" cy="135" r="2.4" fill="#ffffff" opacity={0.4} />
          <Circle cx="66" cy="140" r="1.8" fill="#ffffff" opacity={0.4} />
          <Circle cx="57" cy="132" r="1.5" fill="#ffffff" opacity={0.4} />
        </AnimatedG>
      </G>

      {/* straw */}
      <Line x1="72" y1="6" x2="54" y2="120" stroke="#F6F4FF" strokeWidth="6" strokeLinecap="round" opacity={0.9} />
      <Line
        x1="72"
        y1="6"
        x2="54"
        y2="120"
        stroke={garnish}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="10 10"
        opacity={0.5}
      />

      {/* glass outline + shine */}
      <Path d={INTERIOR} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <Path d="M32,24 L40,140" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />

      {/* fruit garnish on the rim */}
      <G transform="translate(90,18) rotate(12)">
        <Circle r="11" fill={garnish} />
        <Circle r="7.5" fill="#ffffff" opacity={0.35} />
        <Line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="1" opacity={0.5} />
        <Line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" strokeWidth="1" opacity={0.5} />
      </G>

      {showPct && (
        <SvgText
          x="60"
          y="90"
          textAnchor="middle"
          fontSize="26"
          fontWeight="800"
          fill="#0B0A12"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={3}
          // paint the stroke under the fill
          // @ts-ignore - react-native-svg supports paintOrder
          paintOrder="stroke"
        >
          {`${Math.round(target)}%`}
        </SvgText>
      )}
    </Svg>
  );
}
