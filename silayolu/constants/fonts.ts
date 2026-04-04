export const FontFamily = {
  // Barlow Condensed
  display:          'BarlowCondensed_400Regular',
  displayMedium:    'BarlowCondensed_500Medium',
  displaySemiBold:  'BarlowCondensed_600SemiBold',
  displayBold:      'BarlowCondensed_700Bold',
  // Aliases used by challenges / news components
  condensed:        'BarlowCondensed_400Regular',
  condensedMedium:  'BarlowCondensed_500Medium',
  condensedSemiBold:'BarlowCondensed_600SemiBold',
  condensedBold:    'BarlowCondensed_700Bold',
  // Barlow (body)
  body:             'Barlow_400Regular',
  bodyMedium:       'Barlow_400Regular',
  bodySemiBold:     'Barlow_500Medium',
  bodyBold:         'Barlow_700Bold',
  // Short aliases
  regular:          'Barlow_400Regular',
  medium:           'Barlow_500Medium',
  bold:             'Barlow_700Bold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;
