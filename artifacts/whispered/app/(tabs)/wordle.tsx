import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import NavigationDrawer from '@/components/NavigationDrawer';

export default function WordleScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Home</Text>
        <Pressable onPress={() => setShowNavigationDrawer(true)}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>Menu</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          Home coming soon...
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
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
  },
});
