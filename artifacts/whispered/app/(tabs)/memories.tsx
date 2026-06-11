import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import NavigationDrawer from '@/components/NavigationDrawer';
import { supabase } from '@/lib/supabase';

export default function MemoriesScreen() {
  const { user, isLoaded } = useUser();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);

  const fetchMemories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error);
        return;
      }

      setMemories(data || []);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('memories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
        },
        (payload) => {
          fetchMemories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user?.id]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Memories</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>Menu</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : memories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No memories yet. Start creating some with your partner!
          </Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memoryCard}>
              <Text style={[styles.memoryText, { color: colors.foreground }]}>
                {item.text || 'Memory'}
              </Text>
              {item.image_url && (
                <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>
                  [Image attached]
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  memoryCard: {
    backgroundColor: 'rgba(26,26,30,0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  memoryText: { fontSize: 16 },
});