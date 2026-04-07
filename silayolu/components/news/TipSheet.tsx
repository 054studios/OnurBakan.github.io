import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import type { NewsCategory } from '../../types/news';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.75;

const CATEGORIES: NewsCategory[] = ['visa', 'car', 'toll', 'tips'];
const CAT_ICONS: Record<NewsCategory, string> = {
  visa: '🛂', car: '🚗', toll: '💶', tips: '💡',
};

interface TipSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function TipSheet({ visible, onClose }: TipSheetProps) {
  const { t } = useTranslation('news');
  const { user } = useAuthStore();

  const [category, setCategory] = useState<NewsCategory>('tips');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [source, setSource] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
    }
  }, [visible]);

  function handleClose() {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  }

  async function handleSubmit() {
    if (!title.trim() || !excerpt.trim()) return;
    setSubmitting(true);
    try {
      await firestore().collection('news').add({
        category,
        title: title.trim(),
        excerpt: excerpt.trim(),
        source: source.trim() || 'Silayolu Topluluğu',
        languages: ['TR'],
        isCommunity: true,
        authorId: user?.uid ?? 'anonymous',
        publishedAt: firestore.Timestamp.now(),
        createdAt: firestore.Timestamp.now(),
      });
      setToast({ message: t('sheet.success'), type: 'success' });
      setTitle('');
      setExcerpt('');
      setSource('');
      setCategory('tips');
      setTimeout(handleClose, 1200);
    } catch (err) {
      console.warn('[TipSheet] submit error:', err);
      setToast({ message: t('sheet.error'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = title.trim().length > 0 && excerpt.trim().length > 0 && !submitting;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kavWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>{t('sheet.title')}</Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Category */}
            <Text style={styles.label}>{t('sheet.categoryLabel')}</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={styles.catChipIcon}>{CAT_ICONS[cat]}</Text>
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {t(`categories.${cat}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <Text style={styles.label}>{t('sheet.titleLabel')}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={t('sheet.titlePlaceholder')}
              placeholderTextColor={Colors.muted}
              maxLength={120}
            />

            {/* Excerpt */}
            <Text style={styles.label}>{t('sheet.excerptLabel')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={excerpt}
              onChangeText={setExcerpt}
              placeholder={t('sheet.excerptPlaceholder')}
              placeholderTextColor={Colors.muted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            {/* Source */}
            <Text style={styles.label}>{t('sheet.sourceLabel')}</Text>
            <TextInput
              style={styles.input}
              value={source}
              onChangeText={setSource}
              placeholder={t('sheet.sourcePlaceholder')}
              placeholderTextColor={Colors.muted}
            />
          </ScrollView>

          {toast && (
            <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>{t('sheet.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>{t('sheet.submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SHEET_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize['2xl'],
    color: Colors.ink,
    marginHorizontal: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
  },
  label: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  catChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  catChipIcon: { fontSize: 14 },
  catChipText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  catChipTextActive: { color: '#fff' },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },
  toast: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastSuccess: { backgroundColor: Colors.accent3 + '22' },
  toastError:   { backgroundColor: Colors.accent + '22' },
  toastText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.5 },
  submitText: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.md,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
