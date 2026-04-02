import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';
import { COLORS } from '../lib/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    icon: '🔍',
    title: 'Scan Any Website',
    body: 'Enter any domain and get a full security health report in under 60 seconds — 14 scanner modules, 100+ checks.',
  },
  {
    key: '2',
    icon: '📊',
    title: 'Detailed Reports',
    body: 'Every finding includes a severity rating, plain-English explanation, and a step-by-step fix. No jargon.',
  },
  {
    key: '3',
    icon: '👁',
    title: 'Continuous Monitoring',
    body: 'Add sites to monitoring and get instant alerts when your security score drops or a critical issue is found.',
  },
  {
    key: '4',
    icon: '⚡',
    title: "You're Protected",
    body: 'Join thousands of developers and businesses using SecureScan to stay ahead of security threats.',
  },
];

export default function OnboardingScreen() {
  const navigation    = useNavigation<any>();
  const { markOnboardingSeen } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef  = useRef<FlatList>(null);

  const goNext = async () => {
    if (currentIdx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIdx + 1 });
      setCurrentIdx(i => i + 1);
    } else {
      await markOnboardingSeen();
      navigation.replace('Auth');
    }
  };

  const skip = async () => {
    await markOnboardingSeen();
    navigation.replace('Auth');
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.slideIcon}>{item.icon}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideBody}>{item.body}</Text>
    </View>
  );

  const isLast = currentIdx === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.logo}>
        <Text style={styles.logoText}>⚡ SECURESCAN</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={i => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIdx && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.btn} onPress={goNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>{isLast ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg2, alignItems: 'center' },
  skipBtn:    { alignSelf: 'flex-end', padding: 16, marginRight: 8 },
  skipText:   { color: COLORS.text3, fontSize: 15 },
  logo:       { marginTop: 8, marginBottom: 24 },
  logoText:   { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontWeight: '900', fontSize: 18, color: COLORS.primary, letterSpacing: 2 },
  slide:      { width, alignItems: 'center', paddingHorizontal: 40, paddingTop: 24 },
  slideIcon:  { fontSize: 80, marginBottom: 28 },
  slideTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  slideBody:  { fontSize: 16, color: COLORS.text2, textAlign: 'center', lineHeight: 24 },
  dots:       { flexDirection: 'row', marginTop: 40, gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive:  { backgroundColor: COLORS.primary, width: 24 },
  btn:        { marginTop: 32, marginBottom: 20, backgroundColor: COLORS.primary, paddingVertical: 16, paddingHorizontal: 56, borderRadius: 14 },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '800' },
});
