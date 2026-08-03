import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

// A soft 5-point star: the polygon tips are rounded off via a matching-color
// stroke with round line joins, so it reads as a friendly, rounded star
// instead of the sharp Ionicons `star` glyph.
const POINTS =
  '12,2 14.47,8.6 21.51,8.91 15.99,13.3 17.88,20.09 12,16.2 6.12,20.09 8.01,13.3 2.49,8.91 9.53,8.6';

export function RoundedStar({
  size = 20,
  color = '#FFB020',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon
        points={POINTS}
        fill={color}
        stroke={color}
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
