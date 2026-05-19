import React from "react";
import { View, StyleSheet } from "react-native";
import { ShapeKind } from "./constants";

type Props = {
  shape: ShapeKind;
  size: number;
  color: string;
  rotation: number;
};

// Pure-View shape renderer (no SVG dep). Uses borders/transforms.
export function TargetShape({ shape, size, color, rotation }: Props) {
  const glow = {
    shadowColor: color,
    shadowOpacity: 0.95,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  } as const;

  const transform = [{ rotate: `${rotation}deg` }];

  if (shape === "circle") {
    return (
      <View
        style={[
          styles.base,
          glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform,
          },
        ]}
      >
        <View
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: size,
            backgroundColor: "#09090B",
            opacity: 0.85,
          }}
        />
      </View>
    );
  }

  if (shape === "square") {
    return (
      <View
        style={[
          styles.base,
          glow,
          {
            width: size,
            height: size,
            borderRadius: 14,
            backgroundColor: color,
            transform: [{ rotate: `${rotation + 8}deg` }],
          },
        ]}
      >
        <View
          style={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: 6,
            backgroundColor: "#09090B",
            opacity: 0.85,
          }}
        />
      </View>
    );
  }

  if (shape === "triangle") {
    const half = size / 2;
    return (
      <View style={[styles.base, { width: size, height: size, transform }]}>
        <View
          style={[
            glow,
            {
              width: 0,
              height: 0,
              borderLeftWidth: half,
              borderRightWidth: half,
              borderBottomWidth: size,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: color,
            },
          ]}
        />
      </View>
    );
  }

  if (shape === "hexagon") {
    return (
      <View
        style={[
          styles.base,
          { width: size, height: size, transform: [{ rotate: `${rotation}deg` }] },
        ]}
      >
        <View
          style={[
            glow,
            {
              width: size * 0.86,
              height: size * 0.5,
              backgroundColor: color,
            },
          ]}
        />
        <View
          style={{
            position: "absolute",
            top: size * 0.05,
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.43,
            borderRightWidth: size * 0.43,
            borderBottomWidth: size * 0.25,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: size * 0.05,
            width: 0,
            height: 0,
            borderLeftWidth: size * 0.43,
            borderRightWidth: size * 0.43,
            borderTopWidth: size * 0.25,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: color,
          }}
        />
      </View>
    );
  }

  // star — composed of two rotated triangles
  return (
    <View style={[styles.base, { width: size, height: size, transform }]}>
      <View
        style={[
          glow,
          {
            position: "absolute",
            width: 0,
            height: 0,
            borderLeftWidth: size / 2,
            borderRightWidth: size / 2,
            borderBottomWidth: size * 0.85,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
            top: size * 0.03,
          },
        ]}
      />
      <View
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderTopWidth: size * 0.85,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: color,
          bottom: size * 0.03,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});