import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemeBackground from '@/components/ThemeBackground';

interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const NAVIGATION_ITEMS = [
  { name: 'Main', icon: 'home', route: '/' },
  { name: 'Wordle', icon: 'grid', route: '/(tabs)/wordle' },
  { name: 'Chat', icon: 'message-circle', route: '/(tabs)/chat' },
  { name: 'Memories', icon: 'image', route: '/(tabs)/memories' },
  { name: 'More', icon: 'grid', route: '/(tabs)/more' },
];

export default function NavigationDrawer({ visible, onClose }: NavigationDrawerProps) {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const navigateTo = (route: string) => {
    console.log('Navigating to:', route);
    if (route === '/') {
      router.replace('/' as any);
    } else {
      router.push(route as any);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.drawer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <ThemeBackground>
            <View />
          </ThemeBackground>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.drawerContent}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>Navigation</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView 
              style={styles.scrollView} 
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {NAVIGATION_ITEMS.map((item) => (
                <Pressable
                  key={item.name}
                  style={({ pressed }) => [
                    styles.navigationItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  onPress={() => navigateTo(item.route)}
                >
                  <Feather name={item.icon as any} size={24} color={colors.primary} />
                  <Text style={[styles.navigationItemText, { color: colors.text }]}>
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawer: {
    width: '80%',
    height: '100%',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  drawerContent: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  navigationItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    fontFamily: 'System',
  },
});
