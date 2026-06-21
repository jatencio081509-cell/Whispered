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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.drawer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.drawerContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Navigation</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.foreground} />
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
                  style={styles.navigationItem}
                  onPress={() => navigateTo(item.route)}
                >
                  <Feather name={item.icon as any} size={24} color={colors.primary} />
                  <Text style={[styles.navigationItemText, { color: colors.foreground }]}>
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </LinearGradient>
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
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  navigationItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    fontFamily: 'System',
  },
});
