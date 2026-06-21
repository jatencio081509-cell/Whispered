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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function WordleScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Grid Pattern Background */}
      <View style={styles.gridBackground}>
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />
      </View>
      <View style={styles.scanLine} />
      <View style={[styles.headerRow, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Wordle</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: "System",
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: "System",
  },
});
