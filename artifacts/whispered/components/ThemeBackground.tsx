import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";

interface ThemeBackgroundProps {
  children: React.ReactNode;
}

export default function ThemeBackground({ children }: ThemeBackgroundProps) {
  const { theme } = useApp();
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 6200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 6200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 3600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scan, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
      ])
    );

    driftLoop.start();
    pulseLoop.start();
    scanLoop.start();

    return () => {
      driftLoop.stop();
      pulseLoop.stop();
      scanLoop.stop();
    };
  }, [drift, pulse, scan]);

  const waveDrift = {
    transform: [
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-18, 18] }) },
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [8, -8] }) },
      { rotate: drift.interpolate({ inputRange: [0, 1], outputRange: ["-10deg", "-4deg"] }) },
    ],
  };
  const reverseWaveDrift = {
    transform: [
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [16, -16] }) },
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [-4, 10] }) },
      { rotate: drift.interpolate({ inputRange: [0, 1], outputRange: ["7deg", "2deg"] }) },
    ],
  };
  const softPulse = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.05] }) }],
  };
  const floatUp = {
    opacity: drift.interpolate({ inputRange: [0, 1], outputRange: [0.58, 0.92] }),
    transform: [
      { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [12, -18] }) },
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) },
    ],
  };
  const slowSpin = {
    transform: [
      { rotate: drift.interpolate({ inputRange: [0, 1], outputRange: ["-7deg", "7deg"] }) },
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.04] }) },
    ],
  };
  const sweep = {
    opacity: scan.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
    transform: [{ translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [-40, 820] }) }],
  };

  const renderThemeBackground = () => {
    switch (theme) {
      case "ocean":
        return (
          <View pointerEvents="none" style={styles.layer}>
            <LinearGradient
              colors={["#DDF8FF", "#A7E8F5", "#EAFBFF"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View style={[styles.tide, styles.tideDeep, waveDrift]} />
            <Animated.View style={[styles.tide, styles.tideFoam, reverseWaveDrift]} />
            <Animated.View style={[styles.sunWash, styles.oceanSun, softPulse]} />
            <Animated.View style={[styles.bubble, styles.bubbleLarge, floatUp]} />
            <Animated.View style={[styles.bubble, styles.bubbleSmall, softPulse]} />
          </View>
        );
      case "romance":
        return (
          <View pointerEvents="none" style={styles.layer}>
            <LinearGradient
              colors={["#FFF1F5", "#FFE4E8", "#FCE7F3"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View style={[styles.petals, styles.petalSprayOne, softPulse]} />
            <Animated.View style={[styles.petals, styles.petalSprayTwo, slowSpin]} />
            <Animated.View style={[styles.ribbon, styles.ribbonRose, waveDrift]} />
            <Animated.View style={[styles.ribbon, styles.ribbonGold, reverseWaveDrift]} />
          </View>
        );
      case "futuristic":
        return (
          <View pointerEvents="none" style={styles.layer}>
            <LinearGradient
              colors={["#07111F", "#0B1B31", "#050913"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View style={[styles.circuitGrid, softPulse]}>
              <View style={styles.circuitHorizontal} />
              <View style={styles.circuitVertical} />
              <Animated.View style={[styles.circuitNodeTop, slowSpin]} />
              <Animated.View style={[styles.circuitNodeBottom, reverseWaveDrift]} />
            </Animated.View>
            <Animated.View style={[styles.scanLine, sweep]} />
          </View>
        );
      case "simplistic":
        return (
          <View pointerEvents="none" style={styles.layer}>
            <LinearGradient
              colors={["#FBFBF8", "#F1F1EC", "#FFFFFF"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View style={[styles.paperRule, styles.paperRuleTop, softPulse]} />
            <Animated.View style={[styles.paperRule, styles.paperRuleMiddle, waveDrift]} />
            <Animated.View style={[styles.paperRule, styles.paperRuleBottom, reverseWaveDrift]} />
            <Animated.View style={[styles.cornerMark, softPulse]} />
          </View>
        );
      case "nature":
        return (
          <View pointerEvents="none" style={styles.layer}>
            <LinearGradient
              colors={["#EFF4E6", "#DCE9C8", "#FFF8E6"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View style={[styles.hill, styles.hillBack, waveDrift]} />
            <Animated.View style={[styles.hill, styles.hillFront, reverseWaveDrift]} />
            <Animated.View style={[styles.leaf, styles.leafOne, slowSpin]} />
            <Animated.View style={[styles.leaf, styles.leafTwo, floatUp]} />
            <Animated.View style={[styles.sunWash, styles.natureSun, softPulse]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderThemeBackground()}
      {children}
    </>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  tide: {
    position: "absolute",
    width: "145%",
    height: 210,
    borderRadius: 110,
  },
  tideDeep: {
    left: -90,
    bottom: -56,
    backgroundColor: "rgba(2, 132, 199, 0.28)",
    transform: [{ rotate: "-8deg" }],
  },
  tideFoam: {
    right: -90,
    bottom: -118,
    backgroundColor: "rgba(20, 184, 166, 0.2)",
    transform: [{ rotate: "7deg" }],
  },
  sunWash: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  oceanSun: {
    top: -72,
    right: -62,
    backgroundColor: "rgba(255, 255, 255, 0.46)",
  },
  bubble: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.16)",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  bubbleLarge: {
    top: "24%",
    left: "9%",
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  bubbleSmall: {
    top: "52%",
    right: "13%",
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  petals: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(251, 113, 133, 0.2)",
  },
  petalSprayOne: {
    top: -70,
    left: -44,
    transform: [{ scaleX: 1.45 }, { rotate: "20deg" }],
  },
  petalSprayTwo: {
    right: -82,
    bottom: "18%",
    backgroundColor: "rgba(190, 24, 93, 0.13)",
    transform: [{ scaleY: 1.55 }, { rotate: "-28deg" }],
  },
  ribbon: {
    position: "absolute",
    height: 2,
    width: "120%",
    opacity: 0.42,
  },
  ribbonRose: {
    top: "34%",
    left: "-10%",
    backgroundColor: "#BE185D",
    transform: [{ rotate: "-12deg" }],
  },
  ribbonGold: {
    bottom: "24%",
    left: "-8%",
    backgroundColor: "#F59E0B",
    transform: [{ rotate: "9deg" }],
  },
  circuitGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.64,
  },
  circuitHorizontal: {
    position: "absolute",
    top: "31%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0, 229, 255, 0.2)",
  },
  circuitVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: "28%",
    width: 1,
    backgroundColor: "rgba(0, 229, 255, 0.18)",
  },
  circuitNodeTop: {
    position: "absolute",
    top: "18%",
    right: "24%",
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.28)",
    transform: [{ rotate: "45deg" }],
  },
  circuitNodeBottom: {
    position: "absolute",
    bottom: "14%",
    left: "12%",
    width: 104,
    height: 104,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.18)",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0, 229, 255, 0.42)",
  },
  paperRule: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(38, 38, 38, 0.08)",
  },
  paperRuleTop: { top: "22%" },
  paperRuleMiddle: { top: "48%" },
  paperRuleBottom: { top: "74%" },
  cornerMark: {
    position: "absolute",
    top: 28,
    right: 28,
    width: 42,
    height: 42,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(38, 38, 38, 0.16)",
  },
  hill: {
    position: "absolute",
    width: "150%",
    height: 240,
    borderRadius: 120,
  },
  hillBack: {
    left: -110,
    bottom: -82,
    backgroundColor: "rgba(137, 158, 84, 0.24)",
    transform: [{ rotate: "7deg" }],
  },
  hillFront: {
    right: -120,
    bottom: -132,
    backgroundColor: "rgba(63, 125, 32, 0.2)",
    transform: [{ rotate: "-5deg" }],
  },
  leaf: {
    position: "absolute",
    width: 96,
    height: 52,
    borderTopLeftRadius: 54,
    borderBottomRightRadius: 54,
    backgroundColor: "rgba(63, 125, 32, 0.16)",
  },
  leafOne: {
    top: "14%",
    left: "8%",
    transform: [{ rotate: "-28deg" }],
  },
  leafTwo: {
    right: "10%",
    top: "42%",
    backgroundColor: "rgba(183, 121, 31, 0.14)",
    transform: [{ rotate: "34deg" }],
  },
  natureSun: {
    top: -80,
    right: -70,
    backgroundColor: "rgba(245, 158, 11, 0.18)",
  },
});
