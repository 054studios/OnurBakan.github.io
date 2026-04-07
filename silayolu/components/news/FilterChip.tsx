import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';
import type { NewsCategory } from '../../types/news';

export type FilterValue = NewsCategory | 'all';

const FILTERS: FilterValue[] = ['all', 'visa', 'car', 'toll', 'tips'];

interface FilterChipsProps {
  active: FilterValue;
  onChange: (val: FilterValue) => void;
}

export default function FilterChips({ active, onChange }: FilterChipsProps) {
  const { t } = useTranslation('news');

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, active === f && styles.chipActive]}
            onPress={() => onChange(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active === f && styles.labelActive]}>
              {t(`filters.${f}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#fff',
  },
});
