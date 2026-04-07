import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '../../store/i18n';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import {
  supportedLanguages,
  languageLabels,
  type SupportedLanguage,
} from '../../constants/i18n';

// Route: NL → DE → AT → HU → BG → TR
const ROUTE_FLAGS = [
  { flag: '🇳🇱', code: 'NL', color: Colors.accent },
  { flag: '🇩🇪', code: 'DE', color: Colors.ink },
  { flag: '🇦🇹', code: 'AT', color: Colors.accent },
  { flag: '🇭🇺', code: 'HU', color: Colors.accent2 },
  { flag: '🇧🇬', code: 'BG', color: Colors.accent2 },
  { flag: '🇹🇷', code: 'TR', color: Colors.accent },
];

const FLAG_DURATION = 800;   // ms each flag is visible
const FADE_DURATION = 300;   // ms for crossfade
const CYCLE_PAUSE  = 3000;   // ms pause after full cycle before repeating

function useFlagCycle() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        if (cancelled) return;
        setIndex((prev) => (prev + 1) % ROUTE_FLAGS.length);
        // Fade in
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start(() => {
          if (cancelled) return;
          const isLast = index === ROUTE_FLAGS.length - 2; // about to show last
          setTimeout(tick, isLast ? CYCLE_PAUSE : FLAG_DURATION);
        });
      });
    };

    const timer = setTimeout(tick, FLAG_DURATION);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { flag: ROUTE_FLAGS[index], opacity };
}

export default function SplashScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { continueAsGuest, setLanguage, language } = useAuthStore();
  const { flag, opacity } = useFlagCycle();
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Entrance animations
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLangPicker(false);
  };

  const handleGuest = () => {
    continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Animated flag */}
      <Animated.View style={[styles.flagWrap, { opacity }]}>
        <Text style={styles.flagEmoji}>{flag.flag}</Text>
        <Text style={[styles.flagCode, { color: flag.color }]}>{flag.code}</Text>
      </Animated.View>

      {/* Route strip */}
      <View style={styles.routeStrip}>
        {ROUTE_FLAGS.map((item, i) => (
          <View key={item.code} style={styles.routeItem}>
            <Text style={styles.routeFlag}>{item.flag}</Text>
            {i < ROUTE_FLAGS.length - 1 && (
              <Text style={styles.routeArrow}>›</Text>
            )}
          </View>
        ))}
      </View>

      {/* Title block */}
      <Animated.View
        style={[
          styles.titleBlock,
          { opacity: titleAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.appTitle}>SILAYOLU</Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.actions, { opacity: buttonAnim }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnPrimaryText}>{t('splash.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.75}
          onPress={handleGuest}
        >
          <Text style={styles.btnSecondaryText}>{t('splash.continueAsGuest')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Language picker */}
      <Animated.View style={[styles.langSection, { opacity: buttonAnim }]}>
        <Pressable
          style={styles.langToggle}
          onPress={() => setShowLangPicker((v) => !v)}
        >
          <Text style={styles.langToggleText}>
            {languageLabels[language]} ▾
          </Text>
        </Pressable>

        {showLangPicker && (
          <View style={styles.langDropdown}>
            {supportedLanguages.map((lang) => (
              <Pressable
                key={lang}
                style={[
                  styles.langOption,
                  lang === language && styles.langOptionActive,
                ]}
                onPress={() => handleLanguageSelect(lang)}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    lang === language && styles.langOptionTextActive,
                  ]}
                >
                  {languageLabels[lang]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },

  // Flag animation
  flagWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  flagEmoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  flagCode: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['2xl'],
    letterSpacing: 4,
  },

  // Route strip
  routeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 2,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  routeFlag: {
    fontSize: 18,
  },
  routeArrow: {
    color: Colors.muted,
    fontSize: 14,
    marginHorizontal: 2,
  },

  // Title
  titleBlock: {
    alignItems: 'center',
    marginBottom: 56,
  },
  appTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['5xl'],
    color: Colors.ink,
    letterSpacing: 8,
    textTransform: 'uppercase',
    lineHeight: 52,
  },
  tagline: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
    marginTop: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Buttons
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.surface,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  btnSecondaryText: {
    fontFamily: FontFamily.displayMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
    letterSpacing: 0.5,
  },

  // Language picker
  langSection: {
    alignItems: 'center',
    position: 'relative',
  },
  langToggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  langToggleText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  langDropdown: {
    position: 'absolute',
    bottom: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    minWidth: 160,
    shadowColor: Colors.ink,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 4,
  },
  langOption: {
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  langOptionActive: {
    backgroundColor: Colors.bg,
  },
  langOptionText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  langOptionTextActive: {
    color: Colors.accent,
    fontFamily: FontFamily.bodySemiBold,
  },
});
