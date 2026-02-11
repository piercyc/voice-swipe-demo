import React, { useEffect, useMemo, useRef, useState } from "react";

const BASE = import.meta.env.BASE_URL;

function withBase(p) {
  if (!p) return p;
  if (/^https?:\/\//i.test(p)) return p;            // allow full URLs
  const clean = p.startsWith("/") ? p.slice(1) : p; // remove leading slash
  return `${BASE}${clean}`;
}

/**
 * App background:
 * Put a file at:  /public/app-bg.jpg   (or .png/.webp)
 */
const APP_BACKGROUND = withBase("app-bg.png");

/**
 * Card backgrounds:
 * Put files at: /public/card-bg-1.jpg, /public/card-bg-2.jpg, ...
 */
const CARD_BACKGROUNDS = [
  withBase("card-bg-1.png"),
  withBase("card-bg-2.png"),
  withBase("card-bg-3.png"),
  withBase("card-bg-4.png"),
  withBase("card-bg-5.png"),
  withBase("card-bg-6.png"),
  withBase("card-bg-7.png"),
  withBase("card-bg-8.png"),
  withBase("card-bg-9.png"),
  withBase("card-bg-10.png"),
];

function uid() {
  return Math.random().toString(16).slice(2);
}

const menuItemStyle = {
  width: "100%",
  textAlign: "left",
  padding: "12px 12px",
  background: "transparent",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

function FilterItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 8px",
        background: active ? "rgba(120,80,255,0.25)" : "transparent",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontWeight: 700,
        borderRadius: 10,
      }}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}

function IconButton({ onClick, children, tone = "neutral", title, disabled, style }) {
  const tones = {
    neutral: { bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)", fg: "white" },
    good: { bg: "rgba(55, 215, 126, 0.16)", border: "rgba(55, 215, 126, 0.35)", fg: "white" },
    bad: { bg: "rgba(255, 86, 120, 0.22)", border: "rgba(255, 86, 120, 0.45)", fg: "white" },
  };
  const t = tones[tone] || tones.neutral;

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        borderRadius: 14,
        padding: "10px 12px",
        border: `1px solid ${t.border}`,
        background: t.bg,
        color: t.fg,
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  if (!status || status === "none") return null;

  const styles =
    status === "shortlisted"
      ? { bg: "rgba(55, 215, 126, 0.18)", border: "rgba(55, 215, 126, 0.35)", text: "Shortlisted" }
      : { bg: "rgba(255, 255, 255, 0.10)", border: "rgba(255, 255, 255, 0.18)", text: "Skipped" };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
      }}
    >
      {styles.text}
    </div>
  );
}

function SwipeCard({
  voice,
  index,
  total,
  background,
  isPlaying,
  onPlayToggle,
  onPrev,
  onNext,
  onSkipToggle,
  onShortlistToggle,
  canPrev,
  canNext,
}) {
  const isWorkedOn = voice.status && voice.status !== "none";
  const isShortlisted = voice.status === "shortlisted";
  const isSkipped = voice.status === "skipped";

  return (
    <div
      style={{
        width: "min(520px, 92vw)",
        borderRadius: 24,
        padding: 18,
        border: isShortlisted
          ? "1px solid rgba(55, 215, 126, 0.45)"
          : "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
        position: "relative",
        overflow: "hidden",
        backgroundImage: background
          ? `
            linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.62)),
            url(${background})
          `
          : "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: isSkipped ? "saturate(0.8)" : "none",
        opacity: isWorkedOn ? 0.96 : 1,
      }}
    >
      {/* Counter */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.14)",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.2,
          color: "white",
        }}
      >
        {index} / {total}
      </div>

      {/* Status */}
      <div style={{ position: "absolute", top: 14, left: 14 }}>
        <StatusPill status={voice.status} />
      </div>

      {/* Name + Play */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: -0.4,
            lineHeight: 1.1,
            color: "white",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "calc(100% - 120px)",
            marginTop: 30,
          }}
          title={voice.label}
        >
          {voice.label}
        </div>

        <div style={{ marginTop: 30 }}>
          <IconButton onClick={onPlayToggle} title={isPlaying ? "Stop" : "Play"} tone="neutral">
            {isPlaying ? "⏹ Stop" : "▶︎ Play"}
          </IconButton>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <IconButton onClick={onPrev} title="Previous" disabled={!canPrev}>
            ← Prev
          </IconButton>
          <IconButton onClick={onNext} title="Next" disabled={!canNext}>
            Next →
          </IconButton>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Skip = red button with cross */}
          <IconButton
            onClick={onSkipToggle}
            tone="bad"
            title={isSkipped ? "Undo skip" : "Skip"}
            style={{ minWidth: 46, padding: "10px 14px", fontSize: 18, fontWeight: 900 }}
          >
            ✕
          </IconButton>

          <IconButton
            onClick={onShortlistToggle}
            tone={isShortlisted ? "neutral" : "good"}
            title={isShortlisted ? "Remove from shortlist" : "Shortlist"}
          >
            {isShortlisted ? "Shortlisted" : "Shortlist"}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function RankList({ items, onReorder, onPlayToggle, playingId }) {
  const [dragId, setDragId] = useState(null);

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop(targetId) {
    if (!dragId || dragId === targetId) return;

    const from = items.findIndex((x) => x.id === dragId);
    const to = items.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;

    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
    setDragId(null);
  }

  return (
    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
      {items.map((v, idx) => {
        const isPlaying = playingId === v.id;
        const rowBg =
          CARD_BACKGROUNDS.length > 0 && v.bgIndex != null
            ? CARD_BACKGROUNDS[v.bgIndex % CARD_BACKGROUNDS.length]
            : null;

        return (
          <div
            key={v.id}
            draggable
            onDragStart={() => setDragId(v.id)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(v.id)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundImage: rowBg
                ? `linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.78)), url(${rowBg})`
                : "none",
              backgroundColor: rowBg ? "transparent" : "rgba(255,255,255,0.06)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.09)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  flex: "0 0 auto",
                  color: "white",
                }}
                title="Drag to reorder"
              >
                {idx + 1}
              </div>

              <div
                style={{
                  fontWeight: 900,
                  color: "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={v.label}
              >
                {v.label}
              </div>
            </div>

            <IconButton onClick={() => onPlayToggle(v)} title={isPlaying ? "Stop" : "Play"}>
              {isPlaying ? "⏹ Stop" : "▶︎ Play"}
            </IconButton>
          </div>
        );
      })}

      <div style={{ opacity: 0.75, fontSize: 13, color: "white", marginTop: 6 }}>
        Drag to reorder your shortlist by preference.
      </div>
    </div>
  );
}

export default function App() {
  const [deck, setDeck] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [stage, setStage] = useState("swipe"); // swipe | rank

  // shortlist ranking order (IDs). This persists even as you return to browse all.
  const [shortlistOrder, setShortlistOrder] = useState([]);

  // Show-only menu on shortlisting screen (multi-select AND filter)
  const [showOnlyMenuOpen, setShowOnlyMenuOpen] = useState(false);
  const [filter, setFilter] = useState({ genders: [], providers: [] }); // AND across categories

  // Single shared audio player
  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);

  function stopAudio() {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch {
      // ignore
    }
    setPlayingId(null);
  }

  function ensureAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
      audioRef.current.addEventListener("ended", () => setPlayingId(null));
    }
    return audioRef.current;
  }

  function playToggle(voice) {
    if (!voice?.audioSrc) return;

    const audio = ensureAudio();

    if (playingId === voice.id) {
      stopAudio();
      return;
    }

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = voice.audioSrc;
      audio.play();
      setPlayingId(voice.id);
    } catch {
      setPlayingId(null);
    }
  }

  // Load voices from public/voices.json
  useEffect(() => {
    let alive = true;

    async function load() {
      const res = await fetch(withBase("voices.json"), { cache: "no-store" });
      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : []).map((v, i) => {
        const g = typeof v.gender === "string" ? v.gender.toLowerCase() : null;
        const gender = g === "male" || g === "female" ? g : null;

        const p = typeof v.provider === "string" ? v.provider.toLowerCase() : null;
        const provider = p || null;

        return {
          id: v.id ?? `v${String(i + 1).padStart(3, "0")}-${uid()}`,
          label: v.label ?? `Voice ${i + 1}`,
          audioSrc: withBase(v.audioSrc),
          bgIndex: i,
          gender,
          provider, // e.g. "elevenlabs" | "azure"
          status: "none", // none | skipped | shortlisted
        };
      });

      if (!alive) return;
      setDeck(normalized);
      setCursor(0);
      setStage("swipe");
      setShortlistOrder([]);
      setFilter({ genders: [], providers: [] });
      stopAudio();
    }

    load();

    return () => {
      alive = false;
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deckById = useMemo(() => new Map(deck.map((v) => [v.id, v])), [deck]);

  const hasGenderData = useMemo(() => deck.some((v) => v.gender === "male" || v.gender === "female"), [deck]);
  const providerCounts = useMemo(() => {
    const counts = { elevenlabs: 0, azure: 0 };
    for (const v of deck) {
      if (v.provider === "elevenlabs") counts.elevenlabs += 1;
      if (v.provider === "azure") counts.azure += 1;
    }
    return counts;
  }, [deck]);
  const hasProviderData = providerCounts.elevenlabs > 0 || providerCounts.azure > 0;

  // AND filter: each category is OR-within, AND-across
  const visibleIds = useMemo(() => {
    return deck
      .filter((v) => {
        const genderMatch = filter.genders.length === 0 || filter.genders.includes(v.gender);
        const providerMatch = filter.providers.length === 0 || filter.providers.includes(v.provider);
        return genderMatch && providerMatch;
      })
      .map((v) => v.id);
  }, [deck, filter]);

  // Clamp cursor when filters change / deck changes
  useEffect(() => {
    setCursor((c) => {
      if (visibleIds.length === 0) return 0;
      return Math.min(c, visibleIds.length - 1);
    });
  }, [visibleIds.length]);

  const currentId = visibleIds[cursor] || null;
  const current = currentId ? deckById.get(currentId) : null;

  const currentCardBg =
    CARD_BACKGROUNDS.length > 0 && current?.bgIndex != null
      ? CARD_BACKGROUNDS[current.bgIndex % CARD_BACKGROUNDS.length]
      : undefined;

  const canPrev = cursor > 0;
  const canNext = cursor < visibleIds.length - 1;

  function prevCard() {
    stopAudio();
    setCursor((c) => Math.max(0, c - 1));
  }

  function nextCard() {
    stopAudio();
    setCursor((c) => Math.min(visibleIds.length - 1, c + 1));
  }

  function autoAdvance() {
    setCursor((c) => Math.min(visibleIds.length - 1, c + 1));
  }

  function setStatusForCurrent(nextStatus) {
    if (!current) return;
    stopAudio();

    setDeck((d) =>
      d.map((v) => {
        if (v.id !== current.id) return v;
        return { ...v, status: nextStatus };
      })
    );

    if (nextStatus === "shortlisted") {
      setShortlistOrder((order) => (order.includes(current.id) ? order : [...order, current.id]));
    } else {
      setShortlistOrder((order) => order.filter((id) => id !== current.id));
    }

    if (cursor < visibleIds.length - 1) autoAdvance();
  }

  function toggleSkip() {
    if (!current) return;
    const next = current.status === "skipped" ? "none" : "skipped";
    setStatusForCurrent(next);
  }

  function toggleShortlist() {
    if (!current) return;
    const next = current.status === "shortlisted" ? "none" : "shortlisted";
    setStatusForCurrent(next);
  }

  const shortlisted = useMemo(() => {
    const ordered = shortlistOrder.map((id) => deckById.get(id)).filter(Boolean);
    const extras = deck.filter((v) => v.status === "shortlisted" && !shortlistOrder.includes(v.id));
    return [...ordered, ...extras];
  }, [deck, deckById, shortlistOrder]);

  const hasShortlist = shortlisted.length > 0;

  function toggleGender(g) {
    setFilter((f) => ({
      ...f,
      genders: f.genders.includes(g) ? f.genders.filter((x) => x !== g) : [...f.genders, g],
    }));
  }

  function toggleProvider(p) {
    setFilter((f) => ({
      ...f,
      providers: f.providers.includes(p) ? f.providers.filter((x) => x !== p) : [...f.providers, p],
    }));
  }

  function clearFilters() {
    setFilter({ genders: [], providers: [] });
  }

  const activeFiltersCount = filter.genders.length + filter.providers.length;
  const showOnlyLabel = activeFiltersCount === 0 ? "Show only…" : `Filtered (${activeFiltersCount})`;

  const shellStyle = useMemo(
    () => ({
      minHeight: "100vh",
      color: "white",
      padding: 0,
      boxSizing: "border-box",
      background: APP_BACKGROUND
        ? `linear-gradient(180deg, rgba(11,11,18,0.70), rgba(6,6,11,0.85)),
           url(${APP_BACKGROUND}),
           radial-gradient(1200px 600px at 20% 10%, rgba(120,80,255,0.35), transparent 60%),
           radial-gradient(1000px 700px at 80% 30%, rgba(0,255,200,0.18), transparent 60%),
           radial-gradient(900px 600px at 50% 90%, rgba(255,120,160,0.18), transparent 55%),
           linear-gradient(180deg, #0b0b12, #06060b)`
        : "linear-gradient(180deg, #0b0b12, #06060b)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }),
    []
  );

  return (
    <div style={shellStyle}>
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          display: "grid",
          placeItems: "center",
        }}
        onClick={() => setShowOnlyMenuOpen(false)}
      >
        {stage === "swipe" ? (
          current ? (
            <div
              style={{
                position: "relative",
                width: "min(520px, 92vw)",
                height: 380,
                display: "grid",
                placeItems: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Minimal top-right controls: Show only... + go to shortlist */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative" }}>
                  <IconButton
                    onClick={() => setShowOnlyMenuOpen((v) => !v)}
                    title="Filter voices"
                    disabled={!(hasGenderData || hasProviderData)}
                  >
                    {showOnlyLabel}
                  </IconButton>

                  {showOnlyMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: 44,
                        right: 0,
                        width: 240,
                        borderRadius: 16,
                        background: "rgba(15, 15, 24, 0.96)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
                        overflow: "hidden",
                        zIndex: 10,
                        padding: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.6, padding: "4px 6px" }}>Gender</div>

                      {hasGenderData ? (
                        <>
                          <FilterItem
                            label="Male Voices"
                            active={filter.genders.includes("male")}
                            onClick={() => toggleGender("male")}
                          />
                          <FilterItem
                            label="Female Voices"
                            active={filter.genders.includes("female")}
                            onClick={() => toggleGender("female")}
                          />
                        </>
                      ) : (
                        <div style={{ padding: "8px 6px", opacity: 0.65, fontSize: 13 }}>
                          Add <b>gender</b> to voices.json to enable.
                        </div>
                      )}

                      <div style={{ height: 1, background: "rgba(255,255,255,0.10)", margin: "8px 0" }} />

                      <div style={{ fontSize: 12, opacity: 0.6, padding: "4px 6px" }}>Provider</div>

                      {hasProviderData ? (
                        <>
                          {providerCounts.elevenlabs > 0 && (
                            <FilterItem
                              label="ElevenLabs voices"
                              active={filter.providers.includes("elevenlabs")}
                              onClick={() => toggleProvider("elevenlabs")}
                            />
                          )}
                          {providerCounts.azure > 0 && (
                            <FilterItem
                              label="Azure voices"
                              active={filter.providers.includes("azure")}
                              onClick={() => toggleProvider("azure")}
                            />
                          )}
                        </>
                      ) : (
                        <div style={{ padding: "8px 6px", opacity: 0.65, fontSize: 13 }}>
                          Add <b>provider</b> to voices.json to enable.
                        </div>
                      )}

                      <div style={{ height: 1, background: "rgba(255,255,255,0.10)", margin: "8px 0" }} />

                      <button
                        onClick={() => {
                          clearFilters();
                          setShowOnlyMenuOpen(false);
                        }}
                        style={{ ...menuItemStyle, borderRadius: 10 }}
                      >
                        Show all voices
                      </button>
                    </div>
                  )}
                </div>

                <IconButton
                  onClick={() => {
                    stopAudio();
                    setStage("rank");
                  }}
                  tone={hasShortlist ? "good" : "neutral"}
                  disabled={!hasShortlist}
                  title={hasShortlist ? "Go to stack ranking" : "Shortlist at least one voice first"}
                >
                  The Shortlist →
                </IconButton>
              </div>

              <SwipeCard
                voice={current}
                index={cursor + 1}
                total={visibleIds.length}
                background={currentCardBg}
                isPlaying={playingId === current.id}
                onPlayToggle={() => playToggle(current)}
                onPrev={prevCard}
                onNext={nextCard}
                onSkipToggle={toggleSkip}
                onShortlistToggle={toggleShortlist}
                canPrev={canPrev}
                canNext={canNext}
              />
            </div>
          ) : (
            <div
              style={{
                width: "min(520px, 92vw)",
                borderRadius: 24,
                padding: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>
                {visibleIds.length === 0 ? "No voices match this filter" : "No voices loaded"}
              </div>
              <div style={{ opacity: 0.75, marginTop: 8, color: "white" }}>
                {visibleIds.length === 0 ? "Change “Show only…” to Show all voices." : "Check /public/voices.json and /public/audio paths."}
              </div>
              {visibleIds.length === 0 && (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                  <IconButton
                    onClick={() => {
                      clearFilters();
                      setShowOnlyMenuOpen(false);
                    }}
                    title="Clear filters"
                  >
                    Show all voices
                  </IconButton>
                </div>
              )}
            </div>
          )
        ) : (
          <div
            style={{
              width: "min(760px, 92vw)",
              borderRadius: 24,
              padding: 18,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {/* Header: left return, centered title, right spacer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-start" }}>
                <IconButton
                  onClick={() => {
                    stopAudio();
                    setStage("swipe");
                  }}
                  title="Return to all voices"
                >
                  ← Return to all voices
                </IconButton>
              </div>

              <div style={{ flex: "1 1 0", display: "flex", justifyContent: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>The Shortlist</div>
              </div>

              <div style={{ flex: "1 1 0" }} />
            </div>

            {shortlisted.length ? (
              <RankList
                items={shortlisted}
                playingId={playingId}
                onReorder={(next) => setShortlistOrder(next.map((v) => v.id))}
                onPlayToggle={(v) => playToggle(v)}
              />
            ) : (
              <div style={{ marginTop: 12, opacity: 0.75, color: "white" }}>
                No shortlisted voices yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
