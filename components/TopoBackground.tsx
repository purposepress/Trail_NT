import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { buildContours } from "../lib/topo";
import { splash } from "../lib/theme";

export default function TopoBackground({ background }: { background: string }) {
  const { width, height } = useWindowDimensions();
  const c = useMemo(() => buildContours(width, height), [width, height]);
  const { x, y } = c.summit;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={c.minor} stroke="rgba(243,241,236,0.15)" strokeWidth={0.8} fill="none" />
      <Path d={c.index} stroke="rgba(243,241,236,0.34)" strokeWidth={1.4} fill="none" />
      {c.labels.map((l) => (
        <React.Fragment key={l.text + l.x}>
          <Rect x={l.x - 20} y={l.y - 7} width={40} height={14} fill={background} />
          <SvgText
            x={l.x}
            y={l.y + 3.5}
            fontSize={10}
            fontWeight="600"
            fill="rgba(243,241,236,0.55)"
            textAnchor="middle"
          >
            {l.text}
          </SvgText>
        </React.Fragment>
      ))}
      <Polygon points={`${x},${y - 7} ${x + 6},${y + 4} ${x - 6},${y + 4}`} fill={splash.gold} />
    </Svg>
  );
}
