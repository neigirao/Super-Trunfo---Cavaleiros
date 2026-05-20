/**
 * Aurum Sanctum — full visual rewrite of the battle arena.
 * Drop-in replacement for BattleArenaV2: receives the exact same props
 * (logic, state, effects, actions, onSurrender) and orchestrates the
 * Aurum visual layer (cosmic backdrop, doric columns, marble cards,
 * oracle reveal panel, sealed waiting card, hand of remaining cards).
 *
 * Game rules / data flow are untouched.
 */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VictoryEffect from "../../effects/VictoryEffect";
import ParticleEffect from "../../effects/ParticleEffect";
import { aurum, rarityColor, fmt, ATTR_META, ATTR_KEYS, PERIODIC, FORMULAS } from "./tokens";
import type { useBattleLogic, BattleAttribute, ElementCard } from "@/hooks/battle/useBattleLogic";
import type { useBattleState } from "@/hooks/battle/useBattleState";
import type { useBattleEffects } from "@/hooks/battle/useBattleEffects";

interface AurumArenaProps {
  logic: ReturnType<typeof useBattleLogic>;
  state: ReturnType<typeof useBattleState>;
  effects: ReturnType<typeof useBattleEffects>;
  actions: {
    selectAttribute: (attribute: BattleAttribute) => void;
    calculatePower: (card: ElementCard | null) => number;
    skipTimer: () => void;
  };
  onSurrender: () => void;
}

const AurumArena = ({ logic, state, effects, actions, onSurrender }: AurumArenaProps) => {
  const { battle, whoChooses, initialPlayerCards, initialOpponentCards } = logic;
  const { playerCard, opponentCard, selectedAttribute, round } = battle;

  // Local countdown derived from state.isTimerActive (5s window — matches orchestrator)
  const [timeRemaining, setTimeRemaining] = useState(5);
  useEffect(() => {
    if (!state.isTimerActive) {
      setTimeRemaining(5);
      return;
    }
    setTimeRemaining(5);
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, 5 - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) window.clearInterval(interval);
    }, 100);
    return () => window.clearInterval(interval);
  }, [state.isTimerActive]);

  // Determine visual sub-state
  const isReveal = !!selectedAttribute && state.isCardFlipped;
  const isWaiting = whoChooses === "opponent" && !selectedAttribute && !state.isPaused;

  // Inspect overlay (optional, triggered by clicking a hand card)
  const [inspect, setInspect] = useState<ElementCard | null>(null);

  const playerName = "VOCÊ";
  const opponentName = "ORÁCULO";

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-body"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${aurum.inkSoft} 0%, #0a0500 55%, #000 100%), #000`,
        color: aurum.cream,
      }}
    >
      <AurumBackground />
      <AurumConstellations />
      <AurumWatermark />
      <AurumFormulas />
      <AurumColumn side="left" />
      <AurumColumn side="right" />

      {/* Periodic frieze */}
      <div
        className="relative z-[2] flex justify-center gap-[1px] py-[6px]"
        style={{ borderBottom: `1px solid ${aurum.gold}33` }}
      >
        {PERIODIC.slice(0, 30).map(([, , s], i) => (
          <div
            key={i}
            className="flex items-center justify-center font-display font-bold"
            style={{
              width: 22,
              height: 22,
              border: `1px solid ${aurum.gold}33`,
              fontSize: 9,
              color: `${aurum.gold}99`,
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Subbar */}
      <AurumSubbar
        round={round}
        isPaused={state.isPaused}
        onPause={() => state.setPaused(true)}
        onResume={() => state.setPaused(false)}
        onSurrender={onSurrender}
        timerActive={state.isTimerActive}
        timeRemaining={timeRemaining}
        onSkip={actions.skipTimer}
      />

      {/* MAIN BATTLE LAYOUT */}
      <main className="relative z-[3] flex items-center justify-center gap-4 lg:gap-6 px-4 lg:px-16 pt-2 pb-40 h-[calc(100vh-160px)]">
        <AurumPod
          side="left"
          name={playerName}
          title={`AURUM · ${effects.playerLevel.level}`}
          hp={battle.playerDeck.length}
          maxHp={Math.max(initialPlayerCards, battle.playerDeck.length, 1)}
          level={effects.playerLevel.level}
          xp={effects.playerLevel.experience}
          xpMax={effects.playerLevel.experienceToNextLevel}
          wins={battle.playerScore}
        />

        <AurumCard
          card={playerCard}
          side="player"
          chosen={selectedAttribute}
          highlight={isReveal && computeWinner(battle) === "player"}
          locked={isWaiting}
          canSelect={
            whoChooses === "player" &&
            !selectedAttribute &&
            !state.isPaused &&
            state.gamePhase === "battle"
          }
          onSelect={(attr) => actions.selectAttribute(attr)}
        />

        {isReveal && playerCard && opponentCard && selectedAttribute ? (
          <AurumOracle
            attribute={selectedAttribute}
            playerValue={getAttrValue(playerCard, selectedAttribute)}
            opponentValue={getAttrValue(opponentCard, selectedAttribute)}
            winner={computeWinner(battle)}
            playerSymbol={playerCard.symbol}
            opponentSymbol={opponentCard.symbol}
          />
        ) : isWaiting && playerCard ? (
          <AurumWaitingPanel
            attribute={selectedAttribute}
            playerValue={selectedAttribute ? getAttrValue(playerCard, selectedAttribute) : null}
            playerSymbol={playerCard.symbol}
          />
        ) : (
          <AurumCenterIdle whoChooses={whoChooses} />
        )}

        {isWaiting ? (
          <AurumCardBack />
        ) : (
          <AurumCard
            card={opponentCard}
            side="opponent"
            chosen={selectedAttribute}
            highlight={isReveal && computeWinner(battle) === "opponent"}
            locked={false}
            canSelect={false}
            onSelect={() => {}}
          />
        )}

        <AurumPod
          side="right"
          name={opponentName}
          title="ARGENT · XI"
          hp={battle.opponentDeck.length}
          maxHp={Math.max(initialOpponentCards, battle.opponentDeck.length, 1)}
          level={Math.max(1, Math.floor((initialOpponentCards || 6) / 2))}
          xp={battle.opponentScore * 100}
          xpMax={1000}
          wins={battle.opponentScore}
        />
      </main>

      {/* Player hand of remaining cards */}
      <AurumHand
        deck={battle.playerDeck}
        activeId={playerCard?.id}
        onInspect={(c) => setInspect(c)}
      />

      {/* Inspect overlay */}
      <AnimatePresence>
        {inspect && <AurumInspect card={inspect} onClose={() => setInspect(null)} />}
      </AnimatePresence>

      {/* Victory & particles overlays (preserved from previous arena) */}
      <AnimatePresence>
        {effects.showVictoryEffect && (
          <VictoryEffect isVisible={effects.showVictoryEffect} type={effects.victoryType} />
        )}
      </AnimatePresence>
      {effects.showParticles && <ParticleEffect isActive={effects.showParticles} />}
    </div>
  );
};

export default AurumArena;

/* ──────────────────────────────────────────────────────────── helpers */

const getAttrValue = (card: ElementCard, attr: BattleAttribute): number => {
  const v = card[attr];
  return attr === "melting_point" ? Math.abs(v) : v;
};

const computeWinner = (battle: ReturnType<typeof useBattleLogic>["battle"]): "player" | "opponent" | "draw" => {
  if (battle.battleResult === "win") return "player";
  if (battle.battleResult === "lose") return "opponent";
  return "draw";
};

/* ──────────────────────────────────────────────────────────── background */

const AurumBackground = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none opacity-50"
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, ${aurum.gold}, transparent),
          radial-gradient(1px 1px at 40px 70px, ${aurum.cream}, transparent),
          radial-gradient(1px 1px at 50px 160px, ${aurum.gold}, transparent),
          radial-gradient(2px 2px at 130px 40px, #fff, transparent),
          radial-gradient(1px 1px at 80px 220px, ${aurum.gold}, transparent),
          radial-gradient(1px 1px at 200px 90px, ${aurum.cream}, transparent),
          radial-gradient(2px 2px at 340px 200px, ${aurum.gold}, transparent),
          radial-gradient(1px 1px at 290px 130px, #fff, transparent),
          radial-gradient(1px 1px at 150px 280px, ${aurum.gold}, transparent)
        `,
        backgroundSize: "400px 320px",
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 600px 400px at 20% 20%, ${aurum.gold}1a, transparent),
          radial-gradient(ellipse 700px 500px at 80% 80%, ${aurum.blood}10, transparent),
          radial-gradient(ellipse 400px 300px at 50% 50%, ${aurum.gold}14, transparent)
        `,
      }}
    />
  </>
);

const AurumConstellations = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{ opacity: 0.12 }}
    viewBox="0 0 1700 1100"
    preserveAspectRatio="none"
  >
    <g stroke={aurum.gold} strokeWidth="0.5" fill={aurum.gold}>
      <line x1="120" y1="200" x2="220" y2="260" />
      <line x1="220" y1="260" x2="180" y2="360" />
      <line x1="180" y1="360" x2="290" y2="400" />
      <circle cx="120" cy="200" r="2" />
      <circle cx="220" cy="260" r="2" />
      <circle cx="180" cy="360" r="2" />
      <circle cx="290" cy="400" r="2" />

      <line x1="1380" y1="220" x2="1480" y2="280" />
      <line x1="1480" y1="280" x2="1560" y2="200" />
      <circle cx="1380" cy="220" r="2" />
      <circle cx="1480" cy="280" r="2" />
      <circle cx="1560" cy="200" r="2" />

      <line x1="200" y1="840" x2="320" y2="900" />
      <line x1="320" y1="900" x2="260" y2="1000" />
      <circle cx="200" cy="840" r="2" />
      <circle cx="320" cy="900" r="2" />
      <circle cx="260" cy="1000" r="2" />
    </g>
  </svg>
);

const AurumWatermark = () => (
  <div
    className="absolute pointer-events-none hidden lg:grid"
    style={{
      inset: "140px 220px 200px",
      gridTemplateColumns: "repeat(18,1fr)",
      gridTemplateRows: "repeat(7,1fr)",
      opacity: 0.05,
      color: aurum.gold,
      fontFamily: "Cinzel, serif",
      fontWeight: 700,
      fontSize: 14,
    }}
  >
    {PERIODIC.map(([p, g, s], i) => (
      <div
        key={i}
        style={{
          gridColumn: g,
          gridRow: p,
          border: "1.5px solid currentColor",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: "1/1",
          maxWidth: 46,
          maxHeight: 46,
        }}
      >
        {s}
      </div>
    ))}
  </div>
);

const AurumFormulas = () => {
  const positions: Array<{ pos: React.CSSProperties; rot: number }> = [
    { pos: { top: 200, left: 50 }, rot: -12 },
    { pos: { top: 280, right: 50 }, rot: 8 },
    { pos: { bottom: 340, left: 30 }, rot: -4 },
    { pos: { bottom: 280, right: 30 }, rot: 6 },
    { pos: { top: 420, left: 130 }, rot: -8 },
    { pos: { top: 360, right: 140 }, rot: 10 },
    { pos: { bottom: 200, left: 90 }, rot: -6 },
    { pos: { bottom: 240, right: 90 }, rot: 4 },
  ];
  return (
    <>
      {FORMULAS.slice(0, positions.length).map((f, i) => (
        <div
          key={i}
          className="absolute pointer-events-none font-mono-aurum hidden md:block"
          style={{
            ...positions[i].pos,
            transform: `rotate(${positions[i].rot}deg)`,
            fontSize: 16,
            color: `${aurum.gold}1a`,
            fontWeight: 500,
          }}
        >
          {f}
        </div>
      ))}
    </>
  );
};

const AurumColumn = ({ side }: { side: "left" | "right" }) => (
  <div
    className="absolute pointer-events-none hidden xl:block"
    style={{ top: 170, bottom: 180, [side]: 12, width: 38, zIndex: 1 }}
  >
    <div
      style={{
        height: 22,
        background: `linear-gradient(180deg, ${aurum.gold}, ${aurum.goldDark})`,
        border: `1px solid ${aurum.gold}`,
      }}
    />
    <div style={{ height: 4, background: `linear-gradient(180deg, ${aurum.gold}, ${aurum.goldDark})` }} />
    <div
      style={{
        height: "calc(100% - 60px)",
        background: `repeating-linear-gradient(90deg, ${aurum.ink} 0, ${aurum.inkSoft} 4px, ${aurum.ink} 8px)`,
        border: `1px solid ${aurum.gold}66`,
        boxShadow: `0 0 24px ${aurum.gold}26`,
        position: "relative",
      }}
    >
      {["H", "C", "N", "O", "Fe", "Au", "Ag", "Cu"].map((s, i) => (
        <div
          key={i}
          className="font-display"
          style={{
            position: "absolute",
            left: "50%",
            top: `${4 + i * 11}%`,
            transform: "translateX(-50%)",
            fontWeight: 700,
            fontSize: 10,
            color: `${aurum.gold}80`,
          }}
        >
          {s}
        </div>
      ))}
    </div>
    <div style={{ height: 4, background: `linear-gradient(180deg, ${aurum.goldDark}, ${aurum.gold})` }} />
    <div style={{ height: 16, background: `linear-gradient(180deg, ${aurum.goldDeep}, ${aurum.gold})`, border: `1px solid ${aurum.gold}` }} />
  </div>
);

/* ──────────────────────────────────────────────────────────── subbar */

const AurumSubbar = ({
  round,
  isPaused,
  onPause,
  onResume,
  onSurrender,
  timerActive,
  timeRemaining,
  onSkip,
}: {
  round: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSurrender: () => void;
  timerActive: boolean;
  timeRemaining: number;
  onSkip: () => void;
}) => (
  <div
    className="relative z-[4] grid grid-cols-3 items-center px-4 md:px-10 py-2"
    style={{
      background: `linear-gradient(180deg, ${aurum.ink}f2, ${aurum.ink}99)`,
      borderBottom: `1px solid ${aurum.gold}55`,
    }}
  >
    <div className="flex flex-col gap-1">
      <span className="font-display tracking-[0.35em]" style={{ fontSize: 9, color: `${aurum.gold}cc` }}>
        · DUELO ·
      </span>
      <div className="flex items-center gap-2">
        <span className="font-display tracking-[0.3em]" style={{ fontSize: 10, color: aurum.cream }}>
          ROUND
        </span>
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i === ((round - 1) % 5) + 1;
          const done = i <= ((round - 1) % 5);
          return (
            <div
              key={i}
              style={{
                width: active ? 12 : 7,
                height: active ? 12 : 7,
                background: done || active ? aurum.gold : "transparent",
                border: `1.5px solid ${done || active ? aurum.gold : `${aurum.gold}66`}`,
                transform: "rotate(45deg)",
                boxShadow: active ? `0 0 10px ${aurum.gold}` : "none",
              }}
            />
          );
        })}
        <span className="font-mono-aurum" style={{ fontSize: 10, color: `${aurum.gold}99` }}>
          {round}
        </span>
      </div>
    </div>

    <div className="flex flex-col items-center">
      <span className="font-display tracking-[0.4em]" style={{ fontSize: 9, color: `${aurum.gold}cc` }}>
        COSMO RESTANTE
      </span>
      <span
        className="font-mono-aurum font-bold tabular-nums"
        style={{ fontSize: 22, color: timerActive ? aurum.gold : aurum.cream }}
      >
        {timerActive ? `00:${Math.ceil(timeRemaining).toString().padStart(2, "0")}` : "—:—"}
      </span>
      {timerActive && (
        <button
          onClick={onSkip}
          className="font-display tracking-[0.3em] mt-1 hover:opacity-100 opacity-70 transition"
          style={{ fontSize: 9, color: aurum.gold }}
        >
          ↦ PULAR
        </button>
      )}
    </div>

    <div className="flex items-center justify-end gap-2">
      <AurumGhostBtn onClick={isPaused ? onResume : onPause}>
        {isPaused ? "▶ RETOMAR" : "❘❘ PAUSAR"}
      </AurumGhostBtn>
      <AurumDangerBtn onClick={onSurrender}>⚑ DESISTIR</AurumDangerBtn>
    </div>
  </div>
);

const AurumGhostBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...rest
}) => (
  <button
    {...rest}
    className="font-display tracking-[0.3em] hover:bg-[hsl(43_88%_62%/0.12)] transition"
    style={{
      padding: "6px 12px",
      fontSize: 10,
      color: aurum.gold,
      border: `1px solid ${aurum.gold}66`,
      background: "transparent",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const AurumDangerBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...rest
}) => (
  <button
    {...rest}
    className="font-display tracking-[0.3em] hover:opacity-100 opacity-90 transition"
    style={{
      padding: "6px 12px",
      fontSize: 10,
      color: aurum.bloodSoft,
      border: `1px solid ${aurum.blood}99`,
      background: `${aurum.blood}1a`,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

/* ──────────────────────────────────────────────────────────── pod */

const AurumPod = ({
  side,
  name,
  title,
  hp,
  maxHp,
  level,
  xp,
  xpMax,
  wins,
}: {
  side: "left" | "right";
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpMax: number;
  wins: number;
}) => {
  const accent = side === "left" ? aurum.gold : aurum.blood;
  const pct = Math.min(100, (xp / Math.max(1, xpMax)) * 100);
  return (
    <div className="relative hidden md:flex flex-col items-center gap-2 w-[120px] shrink-0 z-[3]">
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: 110,
          height: 110,
          background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
        }}
      />
      <div
        className="relative z-[2] flex items-center justify-center font-display font-black"
        style={{
          width: 84,
          height: 84,
          background: `linear-gradient(180deg, ${aurum.inkSoft}, ${aurum.ink})`,
          border: `2px solid ${accent}`,
          boxShadow: `inset 0 0 18px ${aurum.gold}33, 0 0 0 4px ${accent}33`,
          clipPath: "polygon(20% 0,80% 0,100% 50%,80% 100%,20% 100%,0 50%)",
          fontSize: 26,
          color: aurum.cream,
        }}
      >
        {name.slice(0, 2)}
      </div>

      <div className="font-display font-bold tracking-[0.25em]" style={{ fontSize: 12, color: aurum.cream }}>
        {name}
      </div>
      <div className="font-display tracking-[0.3em]" style={{ fontSize: 8, color: `${aurum.gold}99` }}>
        {title}
      </div>

      <div className="w-[90px] h-px" style={{ background: `${aurum.gold}40` }} />

      <div className="text-center w-full">
        <div className="font-display tracking-[0.4em]" style={{ fontSize: 8, color: `${aurum.gold}99`, marginBottom: 4 }}>
          CARTAS
        </div>
        <div className="flex flex-wrap gap-[2px] justify-center max-w-[100px] mx-auto">
          {[...Array(Math.max(maxHp, 1))].map((_, i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: 16,
                background: i < hp ? accent : "transparent",
                border: `1px solid ${i < hp ? accent : `${aurum.gold}40`}`,
                clipPath: "polygon(50% 0,100% 30%,80% 100%,20% 100%,0 30%)",
                boxShadow: i < hp ? `0 0 6px ${accent}99` : "none",
              }}
            />
          ))}
        </div>
        <div className="mt-1 font-mono-aurum font-bold" style={{ fontSize: 12, color: accent }}>
          {hp} / {maxHp}
        </div>
      </div>

      <div className="w-[90px] h-px" style={{ background: `${aurum.gold}40` }} />

      <div className="w-full px-2">
        <div className="flex justify-between font-display tracking-[0.3em]" style={{ fontSize: 8, color: `${aurum.gold}99` }}>
          <span>NV {level}</span>
          <span>
            {xp}/{xpMax}
          </span>
        </div>
        <div className="relative mt-1" style={{ height: 3, background: `${aurum.gold}26` }}>
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${pct}%`, background: aurum.gold, boxShadow: `0 0 8px ${aurum.gold}` }}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-1 font-display tracking-[0.3em]" style={{ fontSize: 8, color: `${aurum.gold}99` }}>
        <div className="text-center">
          <div>VITÓRIAS</div>
          <div className="font-black" style={{ fontSize: 16, color: aurum.cream }}>
            {wins.toString().padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────── card */

const AurumCard = ({
  card,
  side,
  chosen,
  highlight,
  locked,
  canSelect,
  onSelect,
}: {
  card: ElementCard | null;
  side: "player" | "opponent";
  chosen: BattleAttribute | null;
  highlight: boolean;
  locked: boolean;
  canSelect: boolean;
  onSelect: (attr: BattleAttribute) => void;
}) => {
  if (!card) {
    return <div className="w-[320px] h-[560px] shrink-0" aria-hidden />;
  }
  const aura = rarityColor(card.rarity);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative shrink-0"
      style={{
        width: 320,
        height: 560,
        transform: side === "player" ? "rotate(-1deg)" : "rotate(1deg)",
        zIndex: 2,
      }}
    >
      {/* aura */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: -60,
          background: `radial-gradient(ellipse, ${aura}55 0%, ${aura}22 30%, transparent 70%)`,
          filter: highlight ? `drop-shadow(0 0 24px ${aura})` : "none",
        }}
      />
      {/* marble body */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${aurum.cream} 0%, ${aurum.marbleMid} 30%, ${aurum.marble} 60%, ${aurum.marbleDeep} 100%)`,
          border: `2px solid ${aurum.goldDeep}`,
          boxShadow: `0 0 0 1px ${aurum.ink}, 0 0 0 4px ${aurum.goldDeep}, 0 0 0 5px ${aurum.ink}, 0 0 40px ${aura}${highlight ? "aa" : "55"}`,
        }}
      >
        {/* pediment */}
        <div
          className="absolute -top-px -left-px -right-px z-[2]"
          style={{
            height: 32,
            background: `linear-gradient(180deg, ${aurum.gold}, ${aurum.goldDark})`,
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
          }}
        >
          <div
            className="absolute inset-0 flex items-end justify-center pb-1 font-display font-black tracking-[0.4em]"
            style={{ fontSize: 9, color: aurum.ink }}
          >
            {(card.rarity || "common").toUpperCase()}
          </div>
        </div>

        {/* inner */}
        <div
          className="absolute flex flex-col"
          style={{ inset: "40px 14px 22px", border: `1px solid ${aurum.goldDeep}80` }}
        >
          <div
            className="px-3 pt-2 pb-1 text-center"
            style={{
              borderBottom: `1px solid ${aurum.goldDeep}40`,
              background: `${aurum.goldDeep}12`,
            }}
          >
            <div className="font-display tracking-[0.4em]" style={{ fontSize: 9, color: aurum.goldDeep }}>
              · {card.element_type?.toUpperCase() || "ELEMENTUM"} ·
            </div>
            <div
              className="font-display font-black"
              style={{ fontSize: 14, color: aurum.ink, letterSpacing: "0.05em", marginTop: 2 }}
            >
              CAVALEIRO DO {card.name.toUpperCase()}
            </div>
          </div>

          {/* portrait */}
          <div
            className="relative mx-2 mt-2 mb-1 overflow-hidden"
            style={{
              height: 230,
              border: `2px solid ${aurum.ink}`,
              background: `radial-gradient(circle at 50% 70%, ${aura} 0%, ${aurum.inkSoft} 100%)`,
              boxShadow: `inset 0 0 0 1px ${aurum.goldDeep}, 0 0 20px ${aura}55`,
            }}
          >
            <div
              className="absolute pointer-events-none z-[3]"
              style={{ inset: 6, border: `1px solid ${aurum.gold}80` }}
            />
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={`Cavaleiro do ${card.name}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "50% 0%", zIndex: 1 }}
                loading="lazy"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center font-display font-black"
                style={{ fontSize: 96, color: `${aurum.gold}aa`, textShadow: `0 0 20px ${aurum.gold}` }}
              >
                {card.symbol}
              </div>
            )}

            {/* atomic # */}
            <div
              className="absolute top-2 left-2 z-[4] font-display font-bold tracking-[0.2em]"
              style={{
                padding: "2px 8px",
                background: "rgba(0,0,0,.6)",
                border: `1px solid ${aurum.gold}`,
                fontSize: 10,
                color: aurum.gold,
              }}
            >
              Nº {String(card.atomic_number).padStart(3, "0")}
            </div>
            {/* symbol badge */}
            <div
              className="absolute bottom-2 left-2 z-[4] flex items-center justify-center font-display font-black"
              style={{
                width: 34,
                height: 34,
                background: aurum.gold,
                color: aurum.ink,
                border: `1px solid ${aurum.ink}`,
                fontSize: 16,
                boxShadow: `0 0 10px ${aurum.gold}`,
              }}
            >
              {card.symbol}
            </div>
            <div
              className="absolute bottom-2 right-2 z-[4] font-mono-aurum"
              style={{
                fontSize: 10,
                color: aurum.cream,
                padding: "2px 6px",
                background: "rgba(0,0,0,.55)",
                borderLeft: `2px solid ${aurum.gold}`,
              }}
            >
              {fmt(card.atomic_mass)} u
            </div>
          </div>

          {/* stats */}
          <div className="px-2 pb-1 flex-1 flex flex-col justify-evenly gap-[2px]">
            {ATTR_KEYS.map((k) => {
              const active = k === chosen;
              const interactive = canSelect && !chosen;
              const value = side === "opponent" && !chosen && !active ? "—" : fmt(card[k]);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!interactive}
                  onClick={() => interactive && onSelect(k)}
                  className="relative flex items-center justify-between text-left transition"
                  style={{
                    padding: "5px 8px",
                    background: active
                      ? highlight
                        ? `linear-gradient(90deg, ${aurum.goldDeep}33, ${aurum.gold}88, ${aurum.goldDeep}33)`
                        : locked
                          ? `linear-gradient(90deg, ${aurum.goldDeep}26, ${aurum.gold}66, ${aurum.goldDeep}26)`
                          : `${aurum.goldDeep}26`
                      : "transparent",
                    border: active
                      ? `1px solid ${highlight || locked ? aurum.ink : `${aurum.goldDeep}80`}`
                      : "1px solid transparent",
                    cursor: interactive ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (interactive)
                      (e.currentTarget as HTMLButtonElement).style.background = `${aurum.gold}22`;
                  }}
                  onMouseLeave={(e) => {
                    if (interactive && !active)
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span style={{ color: aurum.goldDeep, fontSize: 12 }}>{ATTR_META[k].icon}</span>
                    <span
                      className="font-display font-bold tracking-[0.18em]"
                      style={{ fontSize: 10, color: aurum.ink }}
                    >
                      {ATTR_META[k].label.toUpperCase()}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-1">
                    <span
                      className="font-mono-aurum font-bold"
                      style={{ fontSize: active ? 16 : 12, color: aurum.ink }}
                    >
                      {value}
                    </span>
                    <span className="font-mono-aurum" style={{ fontSize: 8, color: aurum.goldDeep }}>
                      {ATTR_META[k].unit}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* stylobate */}
        <div
          className="absolute -bottom-0 -left-px -right-px flex items-center justify-center font-display font-bold tracking-[0.3em]"
          style={{
            height: 20,
            background: `linear-gradient(180deg, ${aurum.gold}, ${aurum.goldDark})`,
            fontSize: 8,
            color: aurum.ink,
          }}
        >
          · {card.symbol} · {fmt(card.atomic_mass)} u · {card.element_type?.replace("_", " ").toUpperCase() || ""} ·
        </div>
      </div>
    </motion.div>
  );
};

/* ──────────────────────────────────────────────────────────── card back (waiting) */

const AurumCardBack = () => (
  <motion.div
    initial={{ opacity: 0, rotateY: 180 }}
    animate={{ opacity: 1, rotateY: 0 }}
    transition={{ duration: 0.5 }}
    className="relative shrink-0"
    style={{ width: 320, height: 560, transform: "rotate(1deg)", zIndex: 2 }}
  >
    <div
      className="absolute pointer-events-none"
      style={{
        inset: -24,
        background: `radial-gradient(ellipse, ${aurum.blood}26 0%, transparent 65%)`,
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${aurum.ink} 0%, ${aurum.inkSoft} 50%, #0a0500 100%)`,
        border: `2px solid ${aurum.goldDeep}`,
        boxShadow: `0 0 0 1px ${aurum.ink}, 0 0 0 4px ${aurum.goldDeep}, 0 0 0 5px ${aurum.ink}, 0 0 24px ${aurum.blood}66`,
      }}
    >
      <div
        className="absolute -top-px -left-px -right-px"
        style={{
          height: 32,
          background: `linear-gradient(180deg, ${aurum.goldDeep}, ${aurum.goldDark})`,
          clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 170,
            height: 170,
            background: `radial-gradient(circle, ${aurum.goldDeep}33, transparent)`,
            border: `2px solid ${aurum.goldDeep}`,
            boxShadow: `inset 0 0 30px ${aurum.goldDeep}55, 0 0 24px ${aurum.goldDeep}66`,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{ inset: 12, border: `1px dashed ${aurum.goldDeep}99` }}
          />
          <div
            className="font-display font-black"
            style={{ fontSize: 78, color: aurum.goldDeep, textShadow: `0 0 24px ${aurum.gold}88` }}
          >
            Ω
          </div>
        </div>
        <div className="font-display tracking-[0.5em]" style={{ fontSize: 9, color: `${aurum.goldDeep}cc` }}>
          · CARTA SELADA ·
        </div>
        <div className="font-display font-bold tracking-[0.15em]" style={{ fontSize: 14, color: aurum.cream }}>
          ARCANUM IGNOTUM
        </div>
        <div
          className="px-4 py-1 font-display tracking-[0.35em]"
          style={{
            border: `1px solid ${aurum.blood}99`,
            background: `${aurum.blood}1a`,
            fontSize: 9,
            color: aurum.bloodSoft,
          }}
        >
          ORÁCULO · ESCOLHENDO
        </div>
      </div>
    </div>
  </motion.div>
);

/* ──────────────────────────────────────────────────────────── center panels */

const AurumOracle = ({
  attribute,
  playerValue,
  opponentValue,
  winner,
  playerSymbol,
  opponentSymbol,
}: {
  attribute: BattleAttribute;
  playerValue: number;
  opponentValue: number;
  winner: "player" | "opponent" | "draw";
  playerSymbol: string;
  opponentSymbol: string;
}) => {
  const winColor = winner === "player" ? aurum.gold : winner === "opponent" ? aurum.bloodSoft : aurum.cream;
  const meta = ATTR_META[attribute];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: 220, height: 520, zIndex: 1 }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-80px -40px",
          background: `radial-gradient(circle at center, ${winColor}80 0%, ${winColor}33 35%, transparent 70%)`,
          opacity: 0.7,
        }}
      />
      <div
        className="relative z-[3] text-center"
        style={{
          padding: "20px 22px",
          background: "rgba(10,5,0,.92)",
          border: `2px solid ${winColor}`,
          boxShadow: `0 0 0 1px ${aurum.ink}, 0 0 0 5px ${winColor}40, 0 0 50px ${winColor}cc`,
          minWidth: 210,
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="font-display tracking-[0.45em]" style={{ fontSize: 9, color: aurum.gold }}>
          · ORÁCULO ·
        </div>
        <div
          className="font-display font-black mt-1 mb-3"
          style={{ fontSize: 14, letterSpacing: "0.1em", color: aurum.cream }}
        >
          {meta.label.toUpperCase()}
        </div>
        <div className="py-3" style={{ borderTop: `1px solid ${aurum.gold}66`, borderBottom: `1px solid ${aurum.gold}66` }}>
          <div className="font-display tracking-[0.35em]" style={{ fontSize: 9, color: `${aurum.gold}b3`, marginBottom: 4 }}>
            VOCÊ
          </div>
          <div
            className="font-display font-black"
            style={{
              fontSize: 24,
              color: winner === "player" ? aurum.gold : `${aurum.gold}55`,
              textShadow: winner === "player" ? `0 0 16px ${aurum.gold}99` : "none",
            }}
          >
            {fmt(playerValue)} <span className="font-normal text-[10px]">{meta.unit}</span>
          </div>
          <div className="my-2 flex items-center justify-center gap-2">
            <div style={{ width: 24, height: 1, background: winColor }} />
            <span className="font-display font-black" style={{ fontSize: 16, color: winColor }}>
              ⚔
            </span>
            <div style={{ width: 24, height: 1, background: winColor }} />
          </div>
          <div className="font-display tracking-[0.35em]" style={{ fontSize: 9, color: `${aurum.gold}b3`, marginBottom: 4 }}>
            ORÁCULO
          </div>
          <div
            className="font-display font-black"
            style={{
              fontSize: 24,
              color: winner === "opponent" ? aurum.bloodSoft : `${aurum.gold}55`,
              textShadow: winner === "opponent" ? `0 0 16px ${aurum.bloodSoft}99` : "none",
            }}
          >
            {fmt(opponentValue)} <span className="font-normal text-[10px]">{meta.unit}</span>
          </div>
        </div>

        <div
          className="mt-3 py-2 font-display font-bold tracking-[0.3em]"
          style={{
            background:
              winner === "player"
                ? `linear-gradient(90deg, transparent, ${aurum.gold}55, transparent)`
                : winner === "opponent"
                  ? `linear-gradient(90deg, transparent, ${aurum.blood}55, transparent)`
                  : `linear-gradient(90deg, transparent, ${aurum.cream}33, transparent)`,
            borderTop: `1px solid ${winColor}`,
            borderBottom: `1px solid ${winColor}`,
            fontSize: 10,
            color: winColor,
          }}
        >
          {winner === "player" ? "✦ ATHENA VOS PROTEGE ✦" : winner === "opponent" ? "◆ HADES PREVALECE ◆" : "≡ EQUILIBRIUM ≡"}
        </div>
        <div className="mt-3 font-mono-aurum" style={{ fontSize: 10, color: `${aurum.gold}80` }}>
          Δ {fmt(Math.abs(playerValue - opponentValue))} {meta.unit}
        </div>
        <div className="mt-2 font-mono-aurum" style={{ fontSize: 9, color: `${aurum.gold}80` }}>
          {playerSymbol} + {opponentSymbol}
        </div>
      </div>
    </motion.div>
  );
};

const AurumWaitingPanel = ({
  attribute,
  playerValue,
  playerSymbol,
}: {
  attribute: BattleAttribute | null;
  playerValue: number | null;
  playerSymbol: string;
}) => {
  const meta = attribute ? ATTR_META[attribute] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: 220, height: 520, zIndex: 1 }}
    >
      <div
        className="relative text-center"
        style={{
          padding: "22px 22px",
          background: "rgba(10,5,0,.9)",
          border: `2px solid ${aurum.gold}`,
          boxShadow: `0 0 0 5px ${aurum.gold}33, 0 0 40px ${aurum.gold}88`,
          minWidth: 200,
        }}
      >
        <div className="font-display tracking-[0.5em]" style={{ fontSize: 9, color: `${aurum.gold}b3` }}>
          · SUSPENSIO ·
        </div>
        <div
          className="mx-auto my-4 flex items-center justify-center"
          style={{ width: 70, height: 70, position: "relative" }}
        >
          <div
            className="absolute inset-0"
            style={{
              border: `1px solid ${aurum.gold}66`,
              clipPath: "polygon(15% 0, 85% 0, 50% 50%, 85% 100%, 15% 100%, 50% 50%)",
              background: `linear-gradient(180deg, ${aurum.gold}26, ${aurum.gold}0d)`,
            }}
          />
          <div
            className="font-display thinking-animation"
            style={{ fontSize: 28, color: aurum.gold, textShadow: `0 0 14px ${aurum.gold}` }}
          >
            ⧖
          </div>
        </div>
        {meta && playerValue !== null && (
          <div
            className="py-2"
            style={{
              borderTop: `1px solid ${aurum.gold}4d`,
              borderBottom: `1px solid ${aurum.gold}4d`,
            }}
          >
            <div className="font-display tracking-[0.35em]" style={{ fontSize: 9, color: `${aurum.gold}b3`, marginBottom: 4 }}>
              SUA APOSTA
            </div>
            <div className="font-display font-bold tracking-[0.18em]" style={{ fontSize: 11, color: aurum.cream }}>
              {meta.label.toUpperCase()}
            </div>
            <div
              className="font-display font-black mt-1"
              style={{ fontSize: 22, color: aurum.gold, textShadow: `0 0 14px ${aurum.gold}99` }}
            >
              {fmt(playerValue)} <span className="font-normal text-[10px]">{meta.unit}</span>
            </div>
          </div>
        )}
        <div
          className="mt-3 font-display tracking-[0.3em] flex items-center justify-center gap-2"
          style={{ fontSize: 9, color: `${aurum.gold}99` }}
        >
          <span
            className="thinking-animation"
            style={{ width: 6, height: 6, borderRadius: "50%", background: aurum.gold, boxShadow: `0 0 8px ${aurum.gold}` }}
          />
          O ORÁCULO MEDITA
        </div>
        <div className="mt-3 font-mono-aurum" style={{ fontSize: 9, color: `${aurum.gold}80` }}>
          {playerSymbol} ↔ ???
        </div>
      </div>
    </motion.div>
  );
};

const AurumCenterIdle = ({ whoChooses }: { whoChooses: "player" | "opponent" }) => (
  <div
    className="hidden md:flex flex-col items-center justify-center shrink-0"
    style={{ width: 180, height: 520, zIndex: 1 }}
  >
    <div className="font-display tracking-[0.4em] mb-2" style={{ fontSize: 9, color: `${aurum.gold}99` }}>
      · DUELO ·
    </div>
    <div
      className="font-display font-black"
      style={{ fontSize: 26, color: aurum.gold, textShadow: `0 0 18px ${aurum.gold}66` }}
    >
      ⚔
    </div>
    <div
      className="mt-3 px-3 py-1 font-display tracking-[0.3em] text-center"
      style={{
        border: `1px solid ${aurum.gold}66`,
        background: `${aurum.gold}14`,
        fontSize: 9,
        color: aurum.cream,
      }}
    >
      {whoChooses === "player" ? "ESCOLHA O ATRIBUTO" : "AGUARDE O ORÁCULO"}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────── hand */

const AurumHand = ({
  deck,
  activeId,
  onInspect,
}: {
  deck: ElementCard[];
  activeId?: string;
  onInspect: (c: ElementCard) => void;
}) => {
  const visible = useMemo(() => deck.slice(0, 6), [deck]);
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[7] flex gap-1 items-end">
      <div
        className="flex flex-col justify-center items-end pr-3 mr-1 font-display"
        style={{ borderRight: `1px solid ${aurum.gold}4d`, height: 90 }}
      >
        <div className="tracking-[0.35em]" style={{ fontSize: 8, color: `${aurum.gold}99` }}>
          SUA
        </div>
        <div className="tracking-[0.25em] font-bold" style={{ fontSize: 12, color: aurum.gold }}>
          MÃO
        </div>
        <div className="font-mono-aurum" style={{ fontSize: 9, color: `${aurum.gold}99` }}>
          {String(deck.length).padStart(2, "0")} cartas
        </div>
      </div>
      {visible.map((c, i) => {
        const isA = c.id === activeId || (!activeId && i === 0);
        const rc = rarityColor(c.rarity);
        return (
          <button
            key={c.id + i}
            type="button"
            onClick={() => onInspect(c)}
            className="relative transition"
            style={{
              width: 62,
              height: 92,
              background: isA
                ? `linear-gradient(180deg, ${aurum.cream}, ${aurum.marbleMid})`
                : `linear-gradient(180deg, ${aurum.marble}, ${aurum.marbleDeep})`,
              border: `1.5px solid ${isA ? aurum.gold : `${aurum.goldDeep}80`}`,
              boxShadow: isA
                ? `0 0 0 2px ${aurum.ink}, 0 0 0 3px ${aurum.gold}, 0 -6px 22px ${aurum.gold}99`
                : "0 2px 6px rgba(0,0,0,.5)",
              transform: isA ? "translateY(-10px)" : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 4,
              cursor: "pointer",
            }}
          >
            <span className="font-display font-bold self-start" style={{ fontSize: 8, color: aurum.goldDeep }}>
              {c.atomic_number}
            </span>
            <span className="font-display font-black" style={{ fontSize: 24, color: aurum.ink }}>
              {c.symbol}
            </span>
            <span
              className="font-display font-bold tracking-[0.15em]"
              style={{ fontSize: 6, color: aurum.goldDeep }}
            >
              {c.name.slice(0, 5).toUpperCase()}
            </span>
            <span
              className="absolute top-1 right-1 rounded-full"
              style={{ width: 6, height: 6, background: rc }}
            />
          </button>
        );
      })}
      {deck.length > visible.length && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            width: 62,
            height: 92,
            border: `1px dashed ${aurum.gold}66`,
            background: `${aurum.ink}80`,
            color: aurum.gold,
          }}
        >
          <div className="font-display font-black" style={{ fontSize: 22 }}>
            +
          </div>
          <div className="font-mono-aurum" style={{ fontSize: 10 }}>
            {deck.length - visible.length}
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────── inspect overlay */

const AurumInspect = ({ card, onClose }: { card: ElementCard; onClose: () => void }) => {
  const aura = rarityColor(card.rarity);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-[50] flex items-center justify-center p-6"
      style={{ background: "rgba(6,3,10,.78)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative flex gap-8 items-center max-w-[1400px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0" style={{ width: 420, height: 620 }}>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${aurum.cream} 0%, ${aurum.marbleMid} 30%, ${aurum.marble} 60%, ${aurum.marbleDeep} 100%)`,
              border: `2px solid ${aurum.goldDeep}`,
              boxShadow: `0 0 0 1px ${aurum.ink}, 0 0 0 5px ${aurum.goldDeep}, 0 0 0 6px ${aurum.ink}, 0 0 60px ${aura}88`,
            }}
          >
            <div
              className="absolute -top-px -left-px -right-px"
              style={{
                height: 40,
                background: `linear-gradient(180deg, ${aurum.gold}, ${aurum.goldDark})`,
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                zIndex: 2,
              }}
            >
              <div
                className="absolute inset-0 flex items-end justify-center pb-1 font-display font-black tracking-[0.4em]"
                style={{ fontSize: 11, color: aurum.ink }}
              >
                {(card.rarity || "common").toUpperCase()}
              </div>
            </div>
            <div className="absolute" style={{ inset: "50px 18px 28px", border: `1px solid ${aurum.goldDeep}80` }}>
              <div
                className="px-4 py-3 text-center"
                style={{ borderBottom: `1px solid ${aurum.goldDeep}40`, background: `${aurum.goldDeep}12` }}
              >
                <div className="font-display tracking-[0.4em]" style={{ fontSize: 10, color: aurum.goldDeep }}>
                  · {card.element_type?.toUpperCase() || "ELEMENTUM"} ·
                </div>
                <div
                  className="font-display font-black"
                  style={{ fontSize: 22, color: aurum.ink, letterSpacing: "0.05em", marginTop: 4 }}
                >
                  CAVALEIRO DO {card.name.toUpperCase()}
                </div>
              </div>
              <div
                className="relative mx-3 mt-3 mb-2 overflow-hidden"
                style={{
                  height: 380,
                  border: `2px solid ${aurum.ink}`,
                  background: `radial-gradient(circle at 50% 50%, ${aura} 0%, ${aurum.inkSoft} 100%)`,
                  boxShadow: `inset 0 0 0 1px ${aurum.goldDeep}, 0 0 24px ${aura}66`,
                }}
              >
                <div
                  className="absolute pointer-events-none z-[3]"
                  style={{ inset: 8, border: `1px solid ${aurum.gold}80` }}
                />
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "50% 0%" }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center font-display font-black"
                    style={{ fontSize: 120, color: aurum.gold }}
                  >
                    {card.symbol}
                  </div>
                )}
              </div>
              <div className="px-3 grid grid-cols-2 gap-1">
                {ATTR_KEYS.map((k) => (
                  <div
                    key={k}
                    className="flex justify-between"
                    style={{ padding: "4px 8px", background: `${aurum.goldDeep}1f`, border: `1px solid ${aurum.goldDeep}40` }}
                  >
                    <span className="font-display font-bold tracking-[0.18em]" style={{ fontSize: 9, color: aurum.ink }}>
                      {ATTR_META[k].label.toUpperCase()}
                    </span>
                    <span className="font-mono-aurum font-bold" style={{ fontSize: 11, color: aurum.ink }}>
                      {fmt(card[k])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" style={{ color: aurum.cream }}>
          <div className="font-display tracking-[0.5em]" style={{ fontSize: 11, color: `${aurum.gold}b3` }}>
            · INSPECIONAR ·
          </div>
          <h1
            className="font-display font-black my-2"
            style={{ fontSize: 44, letterSpacing: "0.04em", lineHeight: 1.05, color: aurum.cream }}
          >
            CAVALEIRO
            <br />
            DO {card.name.toUpperCase()}
          </h1>
          <div className="font-display tracking-[0.4em]" style={{ fontSize: 13, color: aurum.gold }}>
            {card.knight_name?.toUpperCase() || card.symbol}
          </div>
          {card.special_ability && (
            <p className="mt-5 leading-relaxed max-w-[520px]" style={{ fontSize: 15, color: `${aurum.cream}d9` }}>
              {card.special_ability}
            </p>
          )}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              ["Nº ATÔMICO", card.atomic_number, ""],
              ["MASSA", fmt(card.atomic_mass), "u"],
              ["DENSIDADE", fmt(card.density), "g/cm³"],
              ["P. FUSÃO", fmt(card.melting_point), "K"],
              ["REATIV.", fmt(card.reactivity), ""],
              ["RADIOAT.", fmt(card.radioactivity), ""],
            ].map(([k, v, u], i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  border: `1px solid ${aurum.gold}4d`,
                  background: `${aurum.gold}0d`,
                }}
              >
                <div className="font-display tracking-[0.3em]" style={{ fontSize: 9, color: `${aurum.gold}b3` }}>
                  {k}
                </div>
                <div className="font-mono-aurum font-bold mt-1" style={{ fontSize: 16, color: aurum.cream }}>
                  {v} <span style={{ fontSize: 10, color: `${aurum.gold}99` }}>{u}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="font-display font-bold tracking-[0.35em] hover:opacity-90 transition"
              style={{
                padding: "12px 28px",
                background: aurum.ink,
                color: aurum.cream,
                border: `2px solid ${aurum.gold}66`,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              ← FECHAR
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:opacity-100 opacity-90 transition"
          style={{
            width: 38,
            height: 38,
            background: "rgba(10,5,0,.7)",
            color: aurum.gold,
            border: `1px solid ${aurum.gold}`,
            fontFamily: "Cinzel, serif",
            fontSize: 18,
            cursor: "pointer",
          }}
          aria-label="Fechar"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
};
