import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { Feather } from '@expo/vector-icons';
import { CustomColors } from '@/constants/colors';

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { customColors, setCustomColors, theme, setTheme } = useApp();

  const [anniversaryInput, setAnniversaryInput] = useState('');
  const [savingDate, setSavingDate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState<keyof CustomColors | null>(null);
  const [colorInput, setColorInput] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<'vibrant' | 'pastel' | 'earth'>('vibrant');

  const colorPalettes = {
    vibrant: [
      '#FF5733', '#FF8C00', '#FFD700', '#ADFF2F', '#32CD32', '#00FF00',
      '#00FA9A', '#00CED1', '#00BFFF', '#1E90FF', '#4169E1', '#0000FF',
      '#8A2BE2', '#9400D3', '#FF00FF', '#FF1493', '#FF69B4', '#FFB6C1',
      '#FFFFFF', '#F5F5F5', '#D3D3D3', '#A9A9A9', '#808080', '#696969',
      '#000000', '#1C1C1C', '#2F4F4F', '#008080', '#006400', '#800000',
    ],
    pastel: [
      '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAFFDF', '#BAFFFF',
      '#C9E4DE', '#B5EAD7', '#C7CEEA', '#E2F0CB', '#FFDAC1', '#FFB7B2',
      '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3', '#F0E68C',
      '#FDFD96', '#FFB347', '#FF6961', '#77DD77', '#AEC6CF', '#F49AC2',
      '#B39EB5', '#DDA0DD', '#CFCFC4', '#779ECB', '#B2EBF2', '#FFC3A0',
    ],
    earth: [
      '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2691E', '#BC8F8F',
      '#F4A460', '#DAA520', '#BDB76B', '#556B2F', '#8FBC8F', '#2E8B57',
      '#3CB371', '#66CDAA', '#48D1CC', '#20B2AA', '#008B8B', '#5F9EA0',
      '#B8860B', '#FFD700', '#B22222', '#A52A2A', '#800000', '#8B0000',
      '#6B4423', '#8B5A2B', '#A0826D', '#C19A6B', '#D2B48C', '#E6BE8A',
    ],
  };

  if (!isLoaded || !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const partnerCode = user.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!partnerCode;
  const currentAnniversary = user.unsafeMetadata?.anniversaryDate as string | undefined;

  const validateDateFormat = (date: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };

  const saveAnniversaryDate = async () => {
    if (!anniversaryInput) return;
    
    if (!validateDateFormat(anniversaryInput)) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }
    
    setSavingDate(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          anniversaryDate: anniversaryInput,
        },
      });
      setAnniversaryInput('');
      setEditingAnniversary(false);
      Alert.alert('Success', 'Anniversary date saved successfully');
    } catch (err) {
      console.error('Failed to save anniversary date', err);
      Alert.alert('Error', 'Failed to save anniversary date. Please try again.');
    } finally {
      setSavingDate(false);
    }
  };

  const deleteAnniversaryDate = async () => {
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          anniversaryDate: null,
        },
      });
      setShowDeleteConfirm(false);
      Alert.alert('Success', 'Anniversary date removed');
    } catch (err) {
      console.error('Failed to delete anniversary date', err);
      Alert.alert('Error', 'Failed to remove anniversary date. Please try again.');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (err) {
              console.error('Sign out failed', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openColorPicker = (colorKey: keyof CustomColors) => {
    setSelectedColorKey(colorKey);
    setColorInput(String(customColors?.[colorKey] || colors[colorKey as keyof typeof colors] || ''));
    setShowColorPicker(true);
  };

  const saveCustomColor = (selectedColor: string) => {
    if (!selectedColorKey) return;

    const updatedColors = { ...customColors };
    updatedColors[selectedColorKey] = selectedColor;
    setCustomColors(updatedColors);
    setShowColorPicker(false);
    Alert.alert('Success', 'Color updated successfully');
  };

  const resetCustomColors = () => {
    Alert.alert(
      'Reset Colors',
      'Are you sure you want to reset all custom colors to the default theme?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setCustomColors(null);
            Alert.alert('Success', 'Colors reset to default');
          },
        },
      ]
    );
  };

  const renderThemeBackground = () => {
    switch (theme) {
      case 'ocean':
        return (
          <>
            <View style={styles.oceanBackground}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
              <View style={[styles.bubble, styles.bubble1]} />
              <View style={[styles.bubble, styles.bubble2]} />
              <View style={[styles.bubble, styles.bubble3]} />
            </View>
          </>
        );
      case 'romance':
        return (
          <>
            <View style={styles.romanceBackground}>
              <View style={[styles.heart, styles.heart1]} />
              <View style={[styles.heart, styles.heart2]} />
              <View style={[styles.heart, styles.heart3]} />
              <View style={[styles.heart, styles.heart4]} />
            </View>
          </>
        );
      case 'futuristic':
        return (
          <>
            <View style={styles.gridBackground}>
              <View style={styles.gridLineHorizontal} />
              <View style={styles.gridLineVertical} />
            </View>
            <View style={styles.scanLine} />
          </>
        );
      case 'simplistic':
        return (
          <>
            <View style={styles.simplisticBackground}>
              <View style={styles.simpleLine1} />
              <View style={styles.simpleLine2} />
              <View style={styles.simpleLine3} />
            </View>
          </>
        );
      case 'nature':
        return (
          <>
            <View style={styles.natureBackground}>
              <View style={[styles.leaf, styles.leaf1]} />
              <View style={[styles.leaf, styles.leaf2]} />
              <View style={[styles.leaf, styles.leaf3]} />
              <View style={[styles.leaf, styles.leaf4]} />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderThemeBackground()}
      
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Status</Text>
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <Feather name={isLinked ? "users" : "user"} size={20} color={isLinked ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {isLinked ? `Linked to ${partnerName || partnerCode}` : "Solo"}
              </Text>
            </View>
            {!isLinked && (
              <Pressable onPress={() => router.push('/(auth)/link-partner')} style={[styles.linkButton, { borderColor: colors.primary }]}>
                <Text style={[styles.linkButtonText, { color: colors.primary }]}>Link Partner</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Your Couple */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Couple</Text>
          {isLinked ? (
            <View style={[styles.coupleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.coupleText, { color: colors.text }]}>
                You're connected with {partnerName || 'your partner'}
              </Text>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/(auth)/link-partner')} style={[styles.emptyCoupleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Link with your partner to unlock couple features
              </Text>
            </Pressable>
          )}
        </View>

        {/* Anniversary Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Anniversary Date</Text>
          {currentAnniversary ? (
            <View style={[styles.anniversaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.anniversaryText, { color: colors.text }]}>{currentAnniversary}</Text>
              <Text style={[styles.anniversarySubtext, { color: colors.mutedForeground }]}>Relationship start date</Text>
              <View style={styles.anniversaryActions}>
                <Pressable onPress={() => { setAnniversaryInput(currentAnniversary); setEditingAnniversary(true); }} style={[styles.anniversaryActionButton, { borderColor: colors.border }]}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                  <Text style={[styles.anniversaryActionText, { color: colors.primary }]}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => setShowDeleteConfirm(true)} style={[styles.anniversaryActionButton, { borderColor: colors.border }]}>
                  <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.anniversaryActionText, { color: colors.mutedForeground }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No anniversary date set yet</Text>
          )}
          {(!currentAnniversary || editingAnniversary) && (
            <View style={styles.dateInputContainer}>
              <TextInput
                value={anniversaryInput}
                onChangeText={setAnniversaryInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.dateInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              />
              <View style={styles.dateButtonRow}>
                {editingAnniversary && (
                  <Pressable onPress={() => { setEditingAnniversary(false); setAnniversaryInput(''); }} style={[styles.cancelButton, { borderColor: colors.border }]}>
                    <Text style={[styles.cancelButtonText, { color: colors.mutedForeground }]}>Cancel</Text>
                  </Pressable>
                )}
                <Pressable onPress={saveAnniversaryDate} disabled={!anniversaryInput || savingDate} style={[styles.saveButton, { backgroundColor: colors.primary, opacity: !anniversaryInput || savingDate ? 0.5 : 1 }]}>
                  <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>{savingDate ? 'Saving...' : 'Save Date'}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
          <View style={styles.themeGrid}>
            {([
              { key: 'ocean' as const, label: 'Ocean', icon: 'droplet' },
              { key: 'romance' as const, label: 'Romance', icon: 'heart' },
              { key: 'futuristic' as const, label: 'Futuristic', icon: 'cpu' },
              { key: 'simplistic' as const, label: 'Simplistic', icon: 'minimize-2' },
              { key: 'nature' as const, label: 'Nature', icon: 'leaf' },
            ]).map(({ key, label, icon }) => (
              <Pressable
                key={key}
                onPress={() => setTheme(key)}
                style={[
                  styles.themeCard,
                  theme === key && { backgroundColor: colors.primary, borderColor: colors.primary },
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name={icon as any} size={24} color={theme === key ? colors.primaryForeground : colors.text} />
                <Text style={[styles.themeLabel, { color: theme === key ? colors.primaryForeground : colors.text }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Color Customization */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Color Customization</Text>
          <View style={[styles.colorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.colorDescription, { color: colors.mutedForeground }]}>
              Customize the app colors to your preference
            </Text>
            <View style={styles.colorGrid}>
              {[
                { key: 'primary' as keyof CustomColors, label: 'Primary' },
                { key: 'chatBoxes' as keyof CustomColors, label: 'Chat Boxes' },
                { key: 'accent' as keyof CustomColors, label: 'Accent' },
                { key: 'background' as keyof CustomColors, label: 'Background' },
                { key: 'card' as keyof CustomColors, label: 'Card' },
                { key: 'text' as keyof CustomColors, label: 'Text' },
              ].map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => openColorPicker(key)}
                  style={styles.colorItem}
                >
                  <View
                    style={[
                      styles.colorPreview,
                      {
                        backgroundColor: customColors?.[key] || (colors[key as keyof Omit<typeof colors, 'radius'>] as string),
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[styles.colorLabel, { color: colors.text }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {customColors && (
              <Pressable onPress={resetCustomColors} style={[styles.resetButton, { borderColor: colors.border }]}>
                <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
                <Text style={[styles.resetButtonText, { color: colors.mutedForeground }]}>Reset to Default</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

          {isLinked && (
            <Pressable 
              onPress={() => router.push('/(auth)/link-partner')} 
              style={[styles.manageLinkButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name="users" size={20} color={colors.primary} />
              <Text style={[styles.manageLinkText, { color: colors.primary }]}>Manage Partner Link</Text>
            </Pressable>
          )}

          <Pressable onPress={handleSignOut} style={[styles.signOutButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="log-out" size={20} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Anniversary Date</Text>
            <Text style={[styles.modalMessage, { color: colors.mutedForeground }]}>Are you sure you want to remove your anniversary date?</Text>
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}>
                <Text style={[styles.modalButtonText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={deleteAnniversaryDate} style={[styles.modalButton, styles.modalDeleteButton, { backgroundColor: '#FF3B30' }]}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Color</Text>
            <Text style={[styles.modalMessage, { color: colors.mutedForeground }]}>
              Select a color for {selectedColorKey}
            </Text>
            <View style={styles.paletteSelector}>
              {(['vibrant', 'pastel', 'earth'] as const).map((palette) => (
                <Pressable
                  key={palette}
                  onPress={() => setSelectedPalette(palette)}
                  style={[
                    styles.paletteButton,
                    selectedPalette === palette && { backgroundColor: colors.primary },
                    { borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.paletteButtonText,
                      { color: selectedPalette === palette ? colors.primaryForeground : colors.text },
                    ]}
                  >
                    {palette.charAt(0).toUpperCase() + palette.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ScrollView style={styles.colorPickerScroll}>
              <View style={styles.presetColorGrid}>
                {colorPalettes[selectedPalette].map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => saveCustomColor(color)}
                    style={[
                      styles.presetColorItem,
                      { borderColor: colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.presetColorSwatch,
                        { backgroundColor: color },
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowColorPicker(false)} style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}>
                <Text style={[styles.modalButtonText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  oceanBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    width: '200%',
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  wave1: {
    bottom: -50,
    left: -50,
    backgroundColor: '#0EA5E9',
    transform: [{ rotate: '-10deg' }],
  },
  wave2: {
    bottom: -80,
    right: -50,
    backgroundColor: '#06B6D4',
    transform: [{ rotate: '5deg' }],
  },
  wave3: {
    bottom: -120,
    left: -100,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '-5deg' }],
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.15,
  },
  bubble1: {
    top: '20%',
    left: '10%',
    width: 80,
    height: 80,
    backgroundColor: '#0EA5E9',
  },
  bubble2: {
    top: '40%',
    right: '15%',
    width: 60,
    height: 60,
    backgroundColor: '#06B6D4',
  },
  bubble3: {
    top: '60%',
    left: '20%',
    width: 100,
    height: 100,
    backgroundColor: '#38BDF8',
  },
  romanceBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  heart: {
    position: 'absolute',
    width: 60,
    height: 60,
    opacity: 0.1,
  },
  heart1: {
    top: '10%',
    left: '10%',
    backgroundColor: '#F43F5E',
    borderRadius: 30,
  },
  heart2: {
    top: '30%',
    right: '15%',
    backgroundColor: '#F472B6',
    borderRadius: 25,
  },
  heart3: {
    bottom: '30%',
    left: '20%',
    backgroundColor: '#FB7185',
    borderRadius: 35,
  },
  heart4: {
    bottom: '15%',
    right: '10%',
    backgroundColor: '#F43F5E',
    borderRadius: 20,
  },
  simplisticBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  simpleLine1: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(107,114,128,0.1)',
  },
  simpleLine2: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(107,114,128,0.1)',
  },
  simpleLine3: {
    position: 'absolute',
    top: '80%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(107,114,128,0.1)',
  },
  natureBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  leaf: {
    position: 'absolute',
    width: 80,
    height: 80,
    opacity: 0.1,
    borderRadius: 40,
  },
  leaf1: {
    top: '15%',
    left: '5%',
    backgroundColor: '#22C55E',
    transform: [{ rotate: '45deg' }],
  },
  leaf2: {
    top: '35%',
    right: '10%',
    backgroundColor: '#4ADE80',
    transform: [{ rotate: '-30deg' }],
  },
  leaf3: {
    bottom: '25%',
    left: '15%',
    backgroundColor: '#86EFAC',
    transform: [{ rotate: '60deg' }],
  },
  leaf4: {
    bottom: '10%',
    right: '5%',
    backgroundColor: '#22C55E',
    transform: [{ rotate: '-45deg' }],
  },
  content: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 8 },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  statusCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { fontSize: 18, fontWeight: '600' },
  linkButton: { marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  linkButtonText: { fontSize: 15, fontWeight: '600' },
  coupleCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  coupleText: { fontSize: 16, fontWeight: '500' },
  emptyCoupleCard: { borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1 },
  emptyText: { textAlign: 'center', fontSize: 15 },
  anniversaryCard: { borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1 },
  anniversaryText: { fontSize: 18, fontWeight: '600' },
  anniversarySubtext: { fontSize: 14, marginTop: 4 },
  anniversaryActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  anniversaryActionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  anniversaryActionText: { fontSize: 14, fontWeight: '600' },
  dateInputContainer: { marginTop: 16 },
  dateInput: { padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 12, borderWidth: 1 },
  dateButtonRow: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
  manageLinkButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    gap: 12, 
    marginBottom: 12,
    borderWidth: 1
  },
  manageLinkText: { fontSize: 16, fontWeight: '600' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12, borderWidth: 1 },
  signOutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 24, borderWidth: 1, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalMessage: { fontSize: 14, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  modalCancelButton: { borderWidth: 1 },
  modalDeleteButton: {},
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  colorCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  colorDescription: { fontSize: 14, marginBottom: 16 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorItem: { alignItems: 'center', width: '30%' },
  colorPreview: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  colorLabel: { fontSize: 12 },
  resetButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, marginTop: 16, alignSelf: 'flex-start' },
  resetButtonText: { fontSize: 14, fontWeight: '600' },
  colorInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  colorPreviewLarge: { width: 60, height: 60, borderRadius: 12, borderWidth: 1 },
  colorInput: { flex: 1, padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1 },
  modalSaveButton: {},
  colorPickerScroll: { maxHeight: 300, marginBottom: 16 },
  presetColorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 8 },
  presetColorItem: { width: 50, height: 50, borderRadius: 8, borderWidth: 1, padding: 4 },
  presetColorSwatch: { flex: 1, borderRadius: 6 },
  paletteSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  paletteButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  paletteButtonText: { fontSize: 14, fontWeight: '600' },
});