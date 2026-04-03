import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

export default function HomeScreen() {
  const { t } = useTranslation('tabs');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
