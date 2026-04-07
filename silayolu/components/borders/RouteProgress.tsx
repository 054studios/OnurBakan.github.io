import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ROUTE_COUNTRIES } from '../../constants/route';
import { useTripStore, type CountryStatus } from '../../store/tripStore';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

const STATUS_COLOR: Record<CountryStatus, string> = {
  completed: Colors.accent3,
  current:   Colors.accent,
  upcoming:  Colors.border,
};

const STATUS_TEXT_COLOR: Record<CountryStatus, string> = {
  completed: Colors.accent3,
  current:   Colors.accent,
  upcoming:  Colors.muted,
};

export function RouteProgress() {
  const { t } = useTranslation('borders');
  const { currentIndex, getStatus, setCurrentIndex } = useTripStore();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('routeProgress')}</Text>

      <View style={styles.stepList}>
        {ROUTE_COUNTRIES.map((country, index) => {
          const status = getStatus(index);
          const isLast = index === ROUTE_COUNTRIES.length - 1;
          const dotColor = STATUS_COLOR[status];

          return (
            <TouchableOpacity
              key={country.code}
              style={styles.step}
              activeOpacity={0.7}
              onPress={() => setCurrentIndex(index)}
            >
              {/* Connector line above dot (skip for first) */}
              <View style={styles.dotColumn}>
                {index > 0 && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: getStatus(index - 1) === 'upcoming' ? Colors.border : Colors.accent3 },
                    ]}
                  />
                )}

                {/* Step dot */}
                <View style={[styles.dotOuter, { borderColor: dotColor }]}>
                  {status === 'completed' ? (
                    <View style={[styles.dotInner, { backgroundColor: dotColor }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  ) : status === 'current' ? (
                    <View style={[styles.dotInner, { backgroundColor: dotColor }]} />
                  ) : (
                    <View style={[styles.dotInnerEmpty]} />
                  )}
                </View>

                {/* Connector line below dot (skip for last) */}
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: status === 'completed' ? Colors.accent3 : Colors.border },
                    ]}
                  />
                )}
              </View>

              {/* Country info */}
              <View style={styles.stepContent}>
                <View style={styles.stepRow}>
                  <Text style={styles.stepFlag}>{country.flag}</Text>
                  <Text style={[styles.stepName, { color: STATUS_TEXT_COLOR[status] }]}>
                    {t(country.nameKey as any)}
                  </Text>
                  {status === 'current' && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>●</Text>
                    </View>
                  )}
                </View>
                {status !== 'upcoming' && (
                  <Text style={[styles.stepSubtext, { color: STATUS_TEXT_COLOR[status] }]}>
                    {t(`stepStatus.${status}`)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const DOT_SIZE = 20;
const LINE_WIDTH = 2;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  stepList: { gap: 0 },
  step: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 44,
  },

  dotColumn: {
    width: DOT_SIZE + 8,
    alignItems: 'center',
  },
  line: {
    width: LINE_WIDTH,
    flex: 1,
    minHeight: 8,
  },
  dotOuter: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  dotInner: {
    width: DOT_SIZE - 8,
    height: DOT_SIZE - 8,
    borderRadius: (DOT_SIZE - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInnerEmpty: {
    width: DOT_SIZE - 8,
    height: DOT_SIZE - 8,
    borderRadius: (DOT_SIZE - 8) / 2,
    backgroundColor: Colors.border,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    lineHeight: 12,
  },

  stepContent: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
    paddingVertical: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepFlag: { fontSize: 16 },
  stepName: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: FontSize.md,
    letterSpacing: 0.3,
  },
  currentBadge: { marginLeft: 4 },
  currentBadgeText: {
    color: Colors.accent,
    fontSize: 8,
  },
  stepSubtext: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    marginTop: 1,
    letterSpacing: 0.2,
  },
});
