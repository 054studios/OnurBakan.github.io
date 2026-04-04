import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/fonts';

interface PodiumEntry {
  rank: number;
  displayName: string;
  totalXP: number;
  isYou: boolean;
}

interface PodiumProps {
  entries: PodiumEntry[];
  youLabel: string;
}

const PODIUM_CONFIG = [
  { rank: 1, height: 90, color: Colors.gold,    medal: '🥇' },
  { rank: 2, height: 65, color: '#A8A8A8',       medal: '🥈' },
  { rank: 3, height: 48, color: '#CD7F32',       medal: '🥉' },
];

const ORDER = [2, 1, 3]; // display: 2nd left, 1st center, 3rd right

export default function Podium({ entries, youLabel }: PodiumProps) {
  const byRank = (rank: number) => entries.find((e) => e.rank === rank);

  return (
    <View style={styles.container}>
      {ORDER.map((rank) => {
        const cfg = PODIUM_CONFIG.find((c) => c.rank === rank)!;
        const entry = byRank(rank);
        return (
          <View key={rank} style={styles.slot}>
            {entry ? (
              <>
                <Text style={styles.medal}>{cfg.medal}</Text>
                <Text style={[styles.name, entry.isYou && styles.youName]} numberOfLines={1}>
                  {entry.displayName}
                  {entry.isYou ? ` ${youLabel}` : ''}
                </Text>
                <Text style={styles.xp}>{entry.totalXP} XP</Text>
              </>
            ) : (
              <Text style={styles.empty}>—</Text>
            )}
            <View style={[styles.pedestal, { height: cfg.height, backgroundColor: cfg.color }]}>
              <Text style={styles.rankNum}>{rank}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 6,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  medal: {
    fontSize: 22,
  },
  name: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    textAlign: 'center',
  },
  youName: {
    color: Colors.accent,
  },
  xp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  pedestal: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  rankNum: {
    fontFamily: FontFamily.condensedBold,
    fontSize: FontSize.lg,
    color: '#fff',
  },
  empty: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
});
