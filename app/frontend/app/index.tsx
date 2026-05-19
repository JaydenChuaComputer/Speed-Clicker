import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { storage } from "../src/utils/storage";
import {
  COLORS,
  DURATION_OPTIONS,
  DurationOption,
  HIGH_SCORE_KEY,
} from "../src/game/constants";

export default function Home() {
  const router = useRouter();
  const [duration, setDuration] = useState<DurationOption>(10);
  const [highScore, setHighScore] = useState<number>(0);

  const loadHighScore = useCallback(async () => {
    const v = await storage.getItem<number>(HIGH_SCORE_KEY, 0);
    setHighScore(typeof v === "number" ? v : 0);
  }, []);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  useFocusEffect(
    useCallback(() => {
      loadHighScore();
    }, [loadHighScore])
  );

  const onStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({ pathname: "/game", params: { duration: String(duration) } });
  };

  const onResetHigh = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await storage.setItem(HIGH_SCORE_KEY, 0);
    setHighScore(0);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Background accent */}
      <LinearGradient
        colors={["#1a0612", "#09090B", "#0a1a0a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.tag} testID="home-tag">
            ARCADE · REACTION
          </Text>
          <Text style={styles.title} testID="home-title">
            SPEED
          </Text>
          <Text style={[styles.title, styles.titleAccent]}>CLICKER</Text>
          <Text style={styles.subtitle}>
            Chase. Tap. Combo. Beat your high.
          </Text>
        </View>

        {/* High score card */}
        <View style={styles.scoreCard} testID="home-highscore-card">
          <View style={styles.scoreHeader}>
            <View style={styles.scoreHeaderLeft}>
              <Ionicons name="trophy" size={18} color={COLORS.warning} />
              <Text style={styles.scoreLabel}>HIGH SCORE</Text>
            </View>
            <Pressable
              onPress={onResetHigh}
              hitSlop={10}
              testID="home-reset-highscore"
            >
              <Ionicons name="refresh" size={16} color={COLORS.textDim} />
            </Pressable>
          </View>
          <Text style={styles.scoreValue} testID="home-highscore-value">
            {highScore}
          </Text>
          <Text style={styles.scoreFoot}>
            {highScore === 0 ? "Play your first game!" : "Can you beat it?"}
          </Text>
        </View>

        {/* Duration selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GAME DURATION</Text>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((d) => {
              const active = d === duration;
              return (
                <Pressable
                  key={d}
                  testID={`duration-chip-${d}`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDuration(d);
                  }}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {d}s
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* How to play */}
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>HOW TO PLAY</Text>
          <Row n="1" text="Tap Start. A glowing shape appears." />
          <Row n="2" text="Tap it before it vanishes — it teleports each hit." />
          <Row n="3" text="Chain quick taps for a combo multiplier." />
          <Row n="4" text="Beat the clock. Beat your high score." />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaWrap}>
        <Pressable
          testID="start-game-button"
          onPress={onStart}
          style={({ pressed }) => [
            styles.cta,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={[COLORS.brand, COLORS.brandTertiary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.ctaText}>START GAME</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.howRow}>
      <View style={styles.howBullet}>
        <Text style={styles.howBulletText}>{n}</Text>
      </View>
      <Text style={styles.howRowText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 8 },

  titleBlock: { marginTop: 24, marginBottom: 28 },
  tag: {
    color: COLORS.brandAccent,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 58,
  },
  titleAccent: {
    color: COLORS.brand,
    textShadowColor: COLORS.brand,
    textShadowRadius: 18,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 15,
    marginTop: 10,
    fontWeight: "500",
  },

  scoreCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  scoreValue: {
    color: COLORS.warning,
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -3,
    marginTop: 8,
    textShadowColor: COLORS.warning,
    textShadowRadius: 22,
  },
  scoreFoot: { color: COLORS.textDim, fontSize: 13, marginTop: 4 },

  section: { marginBottom: 24 },
  sectionLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 12,
  },
  chipRow: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#1f0c10",
    borderColor: COLORS.brand,
  },
  chipText: { color: COLORS.textDim, fontSize: 20, fontWeight: "800" },
  chipTextActive: {
    color: COLORS.brand,
    textShadowColor: COLORS.brand,
    textShadowRadius: 10,
  },

  howCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
  },
  howTitle: {
    color: COLORS.brandAccent,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 14,
  },
  howRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  howBullet: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  howBulletText: { color: COLORS.brandAccent, fontWeight: "800", fontSize: 13 },
  howRowText: { color: COLORS.text, fontSize: 14, flex: 1 },

  ctaWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
  },
  cta: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: COLORS.brand,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  ctaGradient: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },
});