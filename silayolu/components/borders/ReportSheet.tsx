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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import type { BorderDoc } from '../../types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.min(540, SCREEN_HEIGHT * 0.72);
const ANIM_DURATION = 300;

interface Props {
  visible: boolean;
  borders: BorderDoc[];
  onClose: () => void;
}

// ─── Border picker ────────────────────────────────────────────────────────────

function BorderPicker({
  borders,
  selected,
  onSelect,
  t,
}: {
  borders: BorderDoc[];
  selected: BorderDoc | null;
  onSelect: (b: BorderDoc) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.pickerBtn, open && styles.pickerBtnOpen]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        {selected ? (
          <Text style={styles.pickerSelected}>
            {selected.fromFlag} ↔ {selected.toFlag}{'  '}{selected.name}
          </Text>
        ) : (
          <Text style={styles.pickerPlaceholder}>{t('sheet.selectBorder')}</Text>
        )}
        <Text style={styles.pickerChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.pickerDropdown}>
          {borders.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.pickerOption, b.id === selected?.id && styles.pickerOptionActive]}
              onPress={() => { onSelect(b); setOpen(false); }}
            >
              <Text style={styles.pickerOptionText}>
                {b.fromFlag} ↔ {b.toFlag}{'  '}
                <Text style={{ fontFamily: FontFamily.displayBold }}>{b.name}</Text>
              </Text>
              {b.id === selected?.id && (
                <Text style={styles.pickerCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <View style={[styles.toast, type === 'success' ? styles.toastSuccess : styles.toastError]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// ─── ReportSheet ──────────────────────────────────────────────────────────────

export function ReportSheet({ visible, borders, onClose }: Props) {
  const { t } = useTranslation('borders');
  const { user } = useAuthStore();

  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [selectedBorder, setSelectedBorder] = useState<BorderDoc | null>(null);
  const [waitTime, setWaitTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ─ Animate in / out ──────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Pre-select first border if list arrives and nothing selected
  useEffect(() => {
    if (borders.length > 0 && selectedBorder === null) {
      setSelectedBorder(borders[0]);
    }
  }, [borders]);

  const resetForm = () => {
    setWaitTime('');
    setNotes('');
    setToast(null);
    if (borders.length > 0) setSelectedBorder(borders[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ─ Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedBorder || !waitTime.trim()) return;

    const waitMins = parseInt(waitTime, 10);
    if (isNaN(waitMins) || waitMins < 0) return;

    setSubmitting(true);
    try {
      const batch = firestore().batch();

      // Add report document
      const reportRef = firestore().collection('borderReports').doc();
      batch.set(reportRef, {
        borderId: selectedBorder.id,
        borderName: selectedBorder.name,
        waitTimeMinutes: waitMins,
        notes: notes.trim(),
        userId: user?.uid ?? null,
        createdAt: firestore.Timestamp.now(),
      });

      // Update border: latest wait time + increment report count
      const borderRef = firestore().collection('borders').doc(selectedBorder.id);
      batch.update(borderRef, {
        waitTimeMinutes: waitMins,
        reportCount: firestore.FieldValue.increment(1),
        updatedAt: firestore.Timestamp.now(),
      });

      await batch.commit();

      setToast({ message: t('sheet.success'), type: 'success' });
      setTimeout(() => {
        handleClose();
      }, 1400);
    } catch (err) {
      console.warn('[ReportSheet] submit error:', err);
      setToast({ message: t('sheet.error'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!selectedBorder && waitTime.trim().length > 0 && !submitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <KeyboardAvoidingView
        style={styles.sheetWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('sheet.title')}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.sheetBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Border picker */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('sheet.border')}</Text>
              <BorderPicker
                borders={borders}
                selected={selectedBorder}
                onSelect={setSelectedBorder}
                t={t}
              />
            </View>

            {/* Wait time */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('sheet.waitTime')}</Text>
              <TextInput
                style={styles.input}
                value={waitTime}
                onChangeText={setWaitTime}
                placeholder={t('sheet.waitTimePlaceholder')}
                placeholderTextColor={Colors.border}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('sheet.notes')}</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('sheet.notesPlaceholder')}
                placeholderTextColor={Colors.border}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>{t('sheet.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.surface} size="small" />
                ) : (
                  <Text style={styles.submitText}>{t('sheet.submit')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 22, 18, 0.5)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  } as any,
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SHEET_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    shadowColor: Colors.ink,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['2xl'],
    color: Colors.ink,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeBtn: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.lg,
    color: Colors.muted,
  },

  sheetBody: {
    padding: 20,
    gap: 18,
  },

  // Toast
  toast: {
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 3,
  },
  toastSuccess: {
    backgroundColor: '#E6F4EC',
    borderLeftColor: Colors.accent3,
  },
  toastError: {
    backgroundColor: '#FEE8E2',
    borderLeftColor: Colors.accent,
  },
  toastText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },

  // Fields
  field: { gap: 6 },
  fieldLabel: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },

  // Border picker
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerBtnOpen: {
    borderColor: Colors.ink,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  pickerSelected: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  pickerPlaceholder: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.border,
  },
  pickerChevron: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  pickerDropdown: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.ink,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pickerOptionActive: { backgroundColor: Colors.bg },
  pickerOptionText: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.ink,
  },
  pickerCheck: {
    color: Colors.accent3,
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.md,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  cancelText: {
    fontFamily: FontFamily.displayMedium,
    fontSize: FontSize.md,
    color: Colors.muted,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.md,
    color: Colors.surface,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
