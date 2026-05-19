import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { TargetShape } from "../src/game/TargetShape";
import { storage } from "../src/utils/storage";
import {
  COLORS,
  HIGH_SCORE_KEY,
  SHAPES,
  SHAPE_PALETTE,
  ShapeKind,
} from "../src/game/constants";

const TARGET_SIZE = 96;
const ARENA_PAD = 12; // inner padding inside arena for the target

type GameState = "ready" | "countdown" | "playing" | "over";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickShape(prev?: ShapeKind): ShapeKind {
  // Avoid repeating the same shape twice in a row.
  let next = SHAPES[randInt(0, SHAPES.length - 1)];
  if (prev && next === prev) {
    next = SHAPES[(SHAPES.indexOf(prev) + 1) % SHAPES.length];
  }
  return next;
}

function pickColor() {
  return SHAPE_PALETTE[randInt(0, SHAPE_PALETTE.length - 1)];
}

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { duration } = useLocalSearchParams<{ duration?: string }>();
  const totalSeconds = useMemo(() => {
    const n = parseInt(duration ?? "10", 10);
    return [10, 20, 30].includes(n) ? n : 10;
  }, [duration]);

  const [state, setState] = useState<GameState>("ready");
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [shape, setShape] = useState<ShapeKind>("circle");
  const [shapeColor, setShapeColor] = useState<string>(COLORS.brand);
  const [rotation, setRotation] = useState<number>(0);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [arena, setArena] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [comboPulseKey, setComboPulseKey] = useState<number>(0);

  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  const lastTapAt = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load existing high score on mount
  useEffect(() => {
    (async () => {
      const v = await storage.getItem<number>(HIGH_SCORE_KEY, 0);
      setHighScore(typeof v === "number" ? v : 0);
    })();
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const placeTarget = useCallback(
    (w: number, h: number) => {
      const maxX = Math.max(0, w - TARGET_SIZE - ARENA_PAD * 2);
      const maxY = Math.max(0, h - TARGET_SIZE - ARENA_PAD * 2);
      setPos({
        x: ARENA_PAD + randInt(0, maxX),
        y: ARENA_PAD + randInt(0, maxY),
      });
    },
    []
  );

  const onArenaLayout = (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== arena.w || height !== arena.h) {
      setArena({ w: width, h: height });
      placeTarget(width, height);
    }
  };

  const beginCountdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("countdown");
    setCountdown(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(totalSeconds);
    setIsNewHigh(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          startPlay();
          return 0;
        }
        Haptics.selectionAsync();
        return c - 1;
      });
    }, 800);
  };

  const startPlay = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setState("playing");
    setShape(pickShape());
    setShapeColor(pickColor());
    setRotation(randInt(0, 359));
    if (arena.w && arena.h) placeTarget(arena.w, arena.h);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          endGame();
          return 0;
        }
        if (t <= 4) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return t - 1;
      });
    }, 1000);
  };

  const endGame = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState("over");
    // Persist high score
    const prev = (await storage.getItem<number>(HIGH_SCORE_KEY, 0)) ?? 0;
    // capture latest score via state setter trick
    setScore((s) => {
      setMaxCombo((mc) => {
        const finalCombo = Math.max(mc, combo);
        if (s > prev) {
          setIsNewHigh(true);
          setHighScore(s);
          storage.setItem(HIGH_SCORE_KEY, s);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		  
		  console.log("Sending score to:", process.env.EXPO_PUBLIC_API_URL);
		  fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/score`, {
		    method: 'POST',
		    headers: {
			  'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({ score: s }), 
		  })
            .then(response => {
               if (!response.ok) throw new Error("Server rejected the score");
               console.log("Successfully sent to cloud!");
            })
            .catch(error => {
               console.log(error);
               Alert.alert("Cloud Save Failed", String(error));
            });
			
        } else {
          setIsNewHigh(false);
          setHighScore(prev);
        }
        return finalCombo;
      });
      return s;
    });
  }, [combo]);

  const onTarget = () => {
    if (state !== "playing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = Date.now();
    const dt = now - lastTapAt.current;
    lastTapAt.current = now;

    // Combo: continue if tap within 800ms, else reset to 1
    setCombo((c) => {
      const next = dt < 800 && c > 0 ? c + 1 : 1;
      setMaxCombo((m) => Math.max(m, next));
      if (next > 1 && next % 5 === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setComboPulseKey((k) => k + 1);
      }
      return next;
    });

    // Score with combo bonus (every 5th in streak = +2)
    setScore((s) => s + 1);

    // Teleport + reshape + recolor + rotate
    setShape((prev) => pickShape(prev));
    setShapeColor(pickColor());
    setRotation(randInt(0, 359));
    if (arena.w && arena.h) placeTarget(arena.w, arena.h);
  };

  const goHome = () => {
    Haptics.selectionAsync();
    router.replace("/");
  };

  const playAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    beginCountdown();
  };

  const timerPct = state === "playing" ? timeLeft / totalSeconds : 1;
  const timerColor =
    timeLeft <= 3 ? COLORS.brand : timeLeft <= 6 ? COLORS.warning : COLORS.brandAccent;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#0a1a0a", "#09090B", "#1a0612"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top HUD */}
      <View style={styles.hud}>
        <Pressable
          onPress={goHome}
          hitSlop={12}
          style={styles.iconBtn}
          testID="game-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </Pressable>

        <View style={styles.scorePill} testID="game-score-pill">
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue} testID="game-score-value">
            {score}
          </Text>
        </View>

        <View
          style={[styles.timerPill, { borderColor: timerColor }]}
          testID="game-timer-pill"
        >
          <Ionicons name="time" size={14} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]} testID="game-timer-value">
            {state === "playing" || state === "over" ? timeLeft : totalSeconds}s
          </Text>
        </View>
      </View>

      {/* Timer bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.max(0, Math.min(1, timerPct)) * 100}%`, backgroundColor: timerColor },
          ]}
        />
      </View>

      {/* Combo */}
      {state === "playing" && combo >= 2 && (
        <View
          key={comboPulseKey}
          style={styles.comboBadge}
          testID="game-combo-badge"
        >
          <Ionicons name="flame" size={16} color={COLORS.brandTertiary} />
          <Text style={styles.comboText}>{combo}× COMBO</Text>
        </View>
      )}

      {/* Arena */}
      <View style={styles.arena} onLayout={onArenaLayout} testID="game-arena">
        {state === "ready" && (
          <View style={styles.center}>
            <Text style={styles.bigHint}>READY?</Text>
            <Text style={styles.bigSub}>Tap Start to begin</Text>
            <Pressable
              testID="game-start-button"
              onPress={beginCountdown}
              style={({ pressed }) => [
                styles.startBtn,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={[COLORS.brand, COLORS.brandTertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startBtnInner}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.startBtnText}>START</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {state === "countdown" && (
          <View style={styles.center} testID="game-countdown">
            <Text style={styles.countdownNum}>{countdown}</Text>
            <Text style={styles.bigSub}>Get ready…</Text>
          </View>
        )}

        {state === "playing" && (
          <Pressable
            testID="target-shape"
            onPress={onTarget}
            style={[
              styles.target,
              {
                left: pos.x,
                top: pos.y,
                width: TARGET_SIZE,
                height: TARGET_SIZE,
              },
            ]}
            hitSlop={6}
          >
            <TargetShape
              shape={shape}
              size={TARGET_SIZE}
              color={shapeColor}
              rotation={rotation}
            />
          </Pressable>
        )}
      </View>

      {/* Game Over modal */}
      <Modal
        visible={state === "over"}
        transparent
        animationType="fade"
        onRequestClose={goHome}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} testID="gameover-modal">
            {isNewHigh && (
              <View style={styles.celebrate} testID="new-high-banner">
                <Ionicons name="trophy" size={18} color="#000" />
                <Text style={styles.celebrateText}>NEW HIGH SCORE!</Text>
              </View>
            )}

            <Text style={styles.modalTitle}>GAME OVER</Text>

            <Text style={styles.modalScore} testID="gameover-final-score">
              {score}
            </Text>
            <Text style={styles.modalScoreLabel}>FINAL SCORE</Text>

            <View style={styles.statsRow}>
              <Stat label="Max Combo" value={`${maxCombo}×`} color={COLORS.brandTertiary} />
              <View style={styles.statDivider} />
              <Stat
                label="High Score"
                value={`${Math.max(highScore, score)}`}
                color={COLORS.warning}
              />
              <View style={styles.statDivider} />
              <Stat label="Duration" value={`${totalSeconds}s`} color={COLORS.brandAccent} />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={goHome}
                style={[styles.modalBtn, styles.modalBtnGhost]}
                testID="gameover-home-button"
              >
                <Ionicons name="home" size={18} color={COLORS.text} />
                <Text style={styles.modalBtnGhostText}>HOME</Text>
              </Pressable>
              <Pressable
                onPress={playAgain}
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                testID="gameover-play-again-button"
              >
                <LinearGradient
                  colors={[COLORS.brand, COLORS.brandTertiary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBtnGradient}
                >
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.modalBtnPrimaryText}>PLAY AGAIN</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* spacer for insets */}
      <View style={{ height: insets.bottom }} />
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const W = Dimensions.get("window").width;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  hud: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scorePill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scoreLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -1,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timerText: { fontSize: 16, fontWeight: "900", letterSpacing: -0.5 },

  barTrack: {
    height: 4,
    marginHorizontal: 16,
    borderRadius: 999,
    backgroundColor: COLORS.surface2,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999 },

  comboBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: "#27130a",
    borderColor: COLORS.brandTertiary,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
    shadowColor: COLORS.brandTertiary,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  comboText: {
    color: COLORS.brandTertiary,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 13,
  },

  arena: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    backgroundColor: "#0c0c10",
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    position: "relative",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  bigHint: {
    color: COLORS.text,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  bigSub: { color: COLORS.textDim, fontSize: 15, marginTop: 6 },
  countdownNum: {
    color: COLORS.brand,
    fontSize: 120,
    fontWeight: "900",
    letterSpacing: -4,
    textShadowColor: COLORS.brand,
    textShadowRadius: 30,
  },
  startBtn: { marginTop: 28, borderRadius: 16, overflow: "hidden" },
  startBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 36,
    paddingVertical: 16,
  },
  startBtnText: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 2 },

  target: { position: "absolute", alignItems: "center", justifyContent: "center" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: Math.min(W - 32, 420),
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  celebrate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
    shadowColor: COLORS.warning,
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  celebrateText: { color: "#000", fontWeight: "900", letterSpacing: 1.5, fontSize: 12 },
  modalTitle: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalScore: {
    color: COLORS.brand,
    fontSize: 96,
    fontWeight: "900",
    letterSpacing: -5,
    textShadowColor: COLORS.brand,
    textShadowRadius: 24,
    lineHeight: 100,
  },
  modalScoreLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
    marginTop: -4,
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: COLORS.surface2,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  statBlock: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
    marginTop: 2,
  },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  modalActions: { flexDirection: "row", gap: 10, width: "100%" },
  modalBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
  },
  modalBtnGhost: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalBtnGhostText: {
    color: COLORS.text,
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 13,
  },
  modalBtnPrimary: {},
  modalBtnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalBtnPrimaryText: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 13,
  },
});
