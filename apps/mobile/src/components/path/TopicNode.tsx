import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Topic } from '../../types/subject';
import { colors, subjectColors } from '../../theme/colors';
import { SubjectId } from '../../types/subject';

export const ROW_HEIGHT = 148;
export const H_PAD = 24;
const PLATFORM = 84;
const PIN_SIZE = 46;

export interface Point {
  x: number;
  y: number;
}

interface Props {
  topic: Topic;
  index: number;
  subjectId: SubjectId;
  platformImage: ImageSourcePropType;
  side: 'left' | 'right';
  heartsRemaining?: number; // best hearts for this topic (0–3), undefined = never done
  onPress?: () => void;
}

export function getPlatformCenter(
  side: 'left' | 'right',
  row: number,
  width: number,
): Point {
  const y = row * ROW_HEIGHT + PIN_SIZE + PLATFORM * 0.55;
  const x =
    side === 'left'
      ? H_PAD + PLATFORM / 2 + 6
      : width - H_PAD - PLATFORM / 2 - 6;
  return { x, y };
}

function NodePin({
  value,
  borderColor,
  locked,
  completed,
}: {
  value: number;
  borderColor: string;
  locked: boolean;
  completed: boolean;
}) {
  return (
    <View style={styles.pinWrap}>
      <View
        style={[
          styles.pinCircle,
          { borderColor },
          locked && styles.pinCircleLocked,
          completed && styles.pinCircleCompleted,
        ]}
      >
        {completed ? (
          <Ionicons name="checkmark" size={26} color={borderColor} />
        ) : (
          <Text style={[styles.pinNumber, locked && styles.pinNumberLocked]}>
            {value}
          </Text>
        )}
      </View>
      <View style={[styles.pinPointer, { borderTopColor: borderColor }]} />
    </View>
  );
}

export function TopicNode({
  topic,
  index,
  subjectId,
  platformImage,
  side,
  heartsRemaining,
  onPress,
}: Props) {
  const palette = subjectColors[subjectId];
  const isLocked = topic.status === 'locked';
  const isCompleted = topic.status === 'completed';
  const isEven = (index + 1) % 2 === 0;

  const platform = (
    <View style={styles.platformCol}>
      <NodePin
        value={index + 1}
        borderColor={isLocked ? '#5C5A72' : palette.primary}
        locked={isLocked}
        completed={isCompleted}
      />

      <View style={styles.platformStack}>
        <Image
          source={platformImage}
          style={[styles.platformImg, isLocked && styles.platformLocked]}
          resizeMode="contain"
        />
        {isLocked ? (
          <View style={styles.lockOnPlatform}>
            <Ionicons name="lock-closed" size={20} color="#B8B4CC" />
          </View>
        ) : null}
      </View>
    </View>
  );

  const label = (
    <View
      style={[
        styles.labelAlign,
        isEven ? styles.labelBeforeIsland : styles.labelAfterIsland,
      ]}
    >
      <View style={[styles.labelCard, isLocked && styles.labelCardLocked]}>
        <Text style={[styles.labelText, isLocked && styles.labelTextLocked]}>
          {topic.title}
        </Text>

        {/* Hearts row — only for completed topics */}
        {isCompleted && heartsRemaining !== undefined && (
          <View style={styles.heartsRow}>
            {[0, 1, 2].map((i) => (
              <Ionicons
                key={i}
                name="heart"
                size={11}
                color={
                  i < heartsRemaining
                    ? palette.primary
                    : '#D9D5EA'
                }
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      style={[styles.row, isEven && styles.rowEven]}
    >
      {isEven ? (
        <>
          {label}
          {platform}
        </>
      ) : (
        <>
          {platform}
          {label}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  rowEven: {
    justifyContent: 'flex-end',
  },
  platformCol: {
    alignItems: 'center',
    width: PLATFORM + 16,
  },
  pinWrap: {
    alignItems: 'center',
    zIndex: 3,
    marginBottom: -20,
  },
  pinCircle: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4D6D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  pinCircleLocked: {
    backgroundColor: '#E4E1F0',
    shadowOpacity: 0,
  },
  pinCircleCompleted: {
    backgroundColor: '#EDE7FB',
  },
  pinNumber: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  pinNumberLocked: {
    color: '#A39EC2',
  },
  pinPointer: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  platformStack: {
    width: PLATFORM,
    height: PLATFORM,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
  },
  platformImg: {
    width: PLATFORM,
    height: PLATFORM,
    zIndex: 2,
  },
  platformLocked: {
    opacity: 0.48,
  },
  lockOnPlatform: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(8, 6, 20, 0.25)',
    borderRadius: PLATFORM / 2,
  },
  labelAlign: {
    height: PLATFORM,
    marginTop: PIN_SIZE - 20,
    justifyContent: 'center',
    maxWidth: 188,
  },
  labelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#ECE9F7',
    shadowColor: 'rgba(90, 80, 140, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 6,
  },
  labelAfterIsland: {
    marginLeft: 10,
    flexShrink: 1,
  },
  labelBeforeIsland: {
    marginRight: 10,
    flexShrink: 1,
  },
  labelCardLocked: {
    opacity: 0.75,
  },
  labelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  labelTextLocked: {
    color: colors.textMuted,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 3,
  },
});
