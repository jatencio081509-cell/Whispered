import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';

interface ThemeBackgroundProps {
  children: React.ReactNode;
}

export default function ThemeBackground({ children }: ThemeBackgroundProps) {
  const { theme } = useApp();

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
    <>
      {renderThemeBackground()}
      {children}
    </>
  );
}

const styles = StyleSheet.create({
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
});
