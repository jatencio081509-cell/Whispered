import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function GamesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showNavigationDrawer, setShowNavigationDrawer] = React.useState(false);

  const games = [
    {
      id: 'word-game',
      name: 'Word Game',
      emoji: '🎯',
      status: 'Coming Soon',
      description: 'Play word games together',
    },
    {
      id: 'dice-game',
      name: 'Dice Game',
      emoji: '🎲',
      status: 'Coming Soon',
      description: 'Roll the dice and have fun',
    },
    {
      id: 'trivia',
      name: 'Trivia',
      emoji: '❓',
      status: 'Coming Soon',
      description: 'Test your knowledge together',
    },
    {
      id: 'memory-game',
      name: 'Memory Game',
      emoji: '🧠',
      status: 'Coming Soon',
      description: 'Match cards and test memory',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
      <ScrollView style={[styles.scrollView, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.headerRow]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Games</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <Pressable
              key={game.id}
              style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              disabled={game.status === 'Coming Soon'}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <Text style={[styles.gameName, { color: colors.text }]}>{game.name}</Text>
              <Text style={[styles.gameDescription, { color: colors.mutedForeground }]}>
                {game.description}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.mutedForeground }]}>
                <Text style={[styles.statusText, { color: colors.text }]}>{game.status}</Text>
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
      </ThemeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "System",
    fontWeight: '600',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  gameCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  gameEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameName: {
    fontSize: 18,
    fontFamily: "System",
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 14,
    fontFamily: "System",
    textAlign: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "System",
    fontWeight: '600',
  },
});
