import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import NavigationDrawer from '@/components/NavigationDrawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function WordleScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  return (
    <LinearGradient
      colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.scanLine} />
      <View style={[styles.headerRow, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Home</Text>
        <Pressable onPress={() => setShowNavigationDrawer(true)}>
          <Feather name="menu" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          Coming soon...
        </Text>
      </View>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
});
