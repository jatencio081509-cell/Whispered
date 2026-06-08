import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import NavigationDrawer from '@/components/NavigationDrawer';

export default function WordleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [showNavigationDrawer, setShowNavigationDrawer] = React.useState(false);

  return (
    <LinearGradient
      colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Wordle</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={[styles.placeholder, { borderColor: colors.border }]}>
            <Feather name="grid" size={64} color={colors.mutedForeground} />
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
              Wordle coming soon...
            </Text>
          </View>
        </View>
      </View>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 40, 70, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
