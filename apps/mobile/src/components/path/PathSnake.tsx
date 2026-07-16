import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

export interface Point {
  x: number;
  y: number;
}

interface Props {
  points: Point[];
  width: number;
  height: number;
}

function cubicAt(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number,
): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

function sampleSegment(from: Point, to: Point, steps: number): Point[] {
  const cp1: Point = { x: from.x, y: from.y + (to.y - from.y) * 0.55 };
  const cp2: Point = { x: to.x, y: to.y - (to.y - from.y) * 0.55 };
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(cubicAt(from, cp1, cp2, to, i / steps));
  }
  return pts;
}

export function PathSnake({ points, width, height }: Props) {
  const dashes = useMemo(() => {
    if (points.length < 2) return [];

    const all: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const segment = sampleSegment(points[i], points[i + 1], 28);
      if (i > 0) segment.shift();
      all.push(...segment);
    }

    return all
      .map((p, index) => ({ p, index }))
      .filter(({ index }) => index % 3 !== 1);
  }, [points]);

  return (
    <View style={[styles.layer, { width, height }]} pointerEvents="none">
      {dashes.map(({ p }, i) => (
        <View
          key={`dash-${i}-${p.x.toFixed(0)}`}
          style={[
            styles.dash,
            { left: p.x - 2, top: p.y - 2 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  dash: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
});
