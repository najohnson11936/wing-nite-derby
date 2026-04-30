"use client";

import { useState, useEffect, useCallback } from "react";
import { HORSES, PARTICIPANTS, PAYOUTS, TOTAL_POT, ODDS_LAST_UPDATED, type Horse } from "@/lib/horses";
import type { Ad } from "@/app/api/ads/route";

interface RaceResult {
  finish: number;
  horse: string;
  post: number;
}

const ADMIN_PASSWORD = "roses2026";
const STORAGE_KEY = "derby2026results";

function oddsColor(n: number): string {
  if (n <= 6)  return "#f0c040";
  if (n <= 12) return "#a0d080";
  if (n <= 25) return "#80b8e0";
  return "#c08080";
}

function participantFor(horseName: string): string | null {
  return PARTICIPANTS.find((p) => p.horse === horseName)?.name ?? null;
}

function finishLabel(n: number): string {
  if (n === 1) return "1ST";
  if (n === 2) return "2ND";
  if (n === 3) return "3RD";
  return `${n}TH`;
}

function AdCard({ ad }: { ad: Ad }) {
  return (
    <div className="ad-card ad-blink-border mb-3 select-none" style={{ fontSize: 13 }}>
      <div style={{ color: "#ffff00", fontFamily: "'VT323', monospace", fontSize: 11, marginBottom: 2 }}>
        ★ SPONSORED LINK ★
      </div>
      <div style={{ fontFamily: "'Bungee', sans-serif", color: "#ffff00", fontSize: 13, lineHeight: 1.2, marginBottom: 4 }}>
        {ad.product}
      </div>
      <div style={{ color: "#fff", marginBottom: 4, fontSize: 14 }}>{ad.headline}</div>
      <div style={{ color: "#aaddff", marginBottom: 6, fontSize: 12 }}>{ad.tagline}</div>
      <div style={{ color: "#888", fontSize: 11, marginBottom: 6 }}>{ad.url}</div>
      <button
        style={{
          background: "#ff0000",
          color: "#fff",
          border: "2px solid #ffff00",
          fontFamily: "'Bungee', sans-serif",
          fontSize: 11,
          padding: "3px 8px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {ad.cta}
      </button>
    </div>
  );
}

function AdPopup({ ad, onClose }: { ad: Ad; onClose: () => void }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-window" onClick={(e) => e.stopPropagation()}>
        <div className="popup-titlebar">
          <span>Advertisement — Microsoft Internet Explorer</span>
          <button className="popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="popup-body">
          <div style={{ fontFamily: "'VT323', monospace", color: "#ffff00", fontSize: 13, marginBottom: 4 }}>
            *** CONGRATULATIONS — YOU ARE VISITOR #1,000,000! ***
          </div>
          <div style={{ fontFamily: "'Bungee', sans-serif", color: "#ffff00", fontSize: 16, marginBottom: 6, lineHeight: 1.2 }}>
            {ad.product}
          </div>
          <div style={{ color: "#fff", fontSize: 18, marginBottom: 4 }}>{ad.headline}</div>
          <div style={{ color: "#aaddff", fontSize: 14, marginBottom: 8 }}>{ad.tagline}</div>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 10 }}>{ad.url}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={onClose}
              style={{
                background: "#ff0000",
                color: "#fff",
                border: "3px solid #ffff00",
                fontFamily: "'Bungee', sans-serif",
                fontSize: 13,
                padding: "6px 16px",
                cursor: "pointer",
              }}
            >
              {ad.cta}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#333",
                color: "#aaa",
                border: "1px solid #555",
                fontFamily: "'Special Elite', serif",
                fontSize: 12,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotatingBanner({ ads, index }: { ads: Ad[]; index: number }) {
  if (!ads.length) return null;
  const ad = ads[index % ads.length];
  return (
    <div
      style={{
        background: "#000080",
        border: "2px solid var(--gold-bright)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <span
          style={{
            background: "var(--red)",
            color: "#fff",
            fontFamily: "'Bungee', sans-serif",
            fontSize: 10,
            padding: "2px 6px",
            flexShrink: 0,
          }}
        >
          {ad.participant.toUpperCase()}
        </span>
        <span style={{ fontFamily: "'Bungee', sans-serif", color: "#ffff00", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ad.headline}
        </span>
        <span style={{ color: "#aaddff", fontSize: 12, flexShrink: 0, display: "none" }} className="sm:inline">
          {ad.tagline}
        </span>
      </div>
      <button
        style={{
          background: "#ff0000",
          color: "#fff",
          border: "2px solid #ffff00",
          fontFamily: "'Bungee', sans-serif",
          fontSize: 11,
          padding: "3px 10px",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {ad.cta}
      </button>
    </div>
  );
}

export default function DerbyPool() {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [view, setView] = useState<"pool" | "field">("pool");
  const [time, setTime] = useState("");
  const [ads, setAds] = useState<Ad[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adminFinish, setAdminFinish] = useState(1);
  const [adminHorse, setAdminHorse] = useState(HORSES[0].name);

  // Load results from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setResults(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Save results to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results]);

  // ET clock
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch AI-generated ads
  useEffect(() => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((data: Ad[]) => {
        setAds(data);
        if (!popupDismissed) {
          setTimeout(() => setShowPopup(true), 1500);
        }
      })
      .catch(() => { /* silently ignore */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Banner rotation
  useEffect(() => {
    if (!ads.length) return;
    const id = setInterval(() => setCurrentAdIndex((i) => i + 1), 4000);
    return () => clearInterval(id);
  }, [ads.length]);

  const dismissPopup = useCallback(() => {
    setShowPopup(false);
    setPopupDismissed(true);
  }, []);

  const setResult = useCallback(() => {
    const horse = HORSES.find((h) => h.name === adminHorse);
    if (!horse) return;
    setResults((prev) => {
      const filtered = prev.filter(
        (r) => r.finish !== adminFinish && r.horse !== adminHorse
      );
      return [...filtered, { finish: adminFinish, horse: adminHorse, post: horse.post }].sort(
        (a, b) => a.finish - b.finish
      );
    });
  }, [adminFinish, adminHorse]);

  const clearResults = useCallback(() => setResults([]), []);

  // Sorted horses for pool view (participant horses only)
  const poolHorses = HORSES.filter((h) => participantFor(h.name)).sort((a, b) => {
    const ra = results.find((r) => r.horse === a.name);
    const rb = results.find((r) => r.horse === b.name);
    if (ra && rb) return ra.finish - rb.finish;
    if (ra) return -1;
    if (rb) return 1;
    return a.oddsNum - b.oddsNum;
  });

  // Full field sorted by post
  const fullField = [...HORSES].sort((a, b) => a.post - b.post);

  const displayHorses = view === "pool" ? poolHorses : fullField;

  // Pool standings: only participant horses, ranked by their actual finish position
  const poolResults = [...results]
    .filter((r) => participantFor(r.horse) !== null)
    .sort((a, b) => a.finish - b.finish);

  const poolWin   = poolResults[0];
  const poolPlace = poolResults[1];
  const poolShow  = poolResults[2];
  const raceOver  = results.length > 0;

  const marqueeText = poolWin
    ? `🏆 POOL WIN: ${poolWin.horse} — ${participantFor(poolWin.horse)} WINS $${PAYOUTS[1]}!! 🌹 ${poolPlace ? `PLACE: ${poolPlace.horse} — ${participantFor(poolPlace.horse)} +$${PAYOUTS[2]}` : ""} ${poolShow ? `🌹 SHOW: ${poolShow.horse} — ${participantFor(poolShow.horse)} +$${PAYOUTS[3]}` : ""} 🌹 CONGRATULATIONS!! 🌹`
    : `🌹 WING NIGHT PRESENTS THE 2026 KENTUCKY DERBY POOL 🌹 10 PARTICIPANTS — $${TOTAL_POT} POT 🌹 WIN $${PAYOUTS[1]} / PLACE $${PAYOUTS[2]} / SHOW $${PAYOUTS[3]} 🌹 POST TIME: 6:57 PM ET — GOOD LUCK EVERYONE!! 🌹`;

  const leftAds  = ads.filter((_, i) => i % 3 === 0);
  const rightAds = ads.filter((_, i) => i % 3 === 1);
  const popupAd  = ads.find((_, i) => i % 3 === 2) ?? ads[2];

  function renderHorseCard(horse: Horse) {
    const participant = participantFor(horse.name);
    const result = results.find((r) => r.horse === horse.name);
    const poolRank = poolResults.findIndex((r) => r.horse === horse.name); // 0=win,1=place,2=show,-1=none
    const isWinner = poolRank === 0;

    return (
      <div
        key={horse.name}
        className={`horse-card ${isWinner ? "winner-card" : ""}`}
        style={isWinner ? { border: "2px solid var(--gold-bright)" } : undefined}
      >
        {isWinner && (
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              color: "var(--gold-bright)",
              fontFamily: "'VT323', monospace",
              fontSize: 13,
              fontWeight: "bold",
            }}
            className="blink"
          >
            ★ WINNER ★
          </div>
        )}

        {/* Post + name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="post-badge">{horse.post}</span>
          <span
            style={{
              fontFamily: "'Bungee', sans-serif",
              color: "var(--gold-bright)",
              fontSize: 15,
              lineHeight: 1.2,
            }}
          >
            {horse.name}
          </span>
        </div>

        {/* Odds */}
        <div style={{ marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 20,
              color: oddsColor(horse.oddsNum),
              marginRight: 4,
            }}
          >
            {horse.odds}
          </span>
          <span style={{ fontSize: 11, color: "var(--gold)", opacity: 0.7 }}>ODDS</span>
        </div>

        {/* Jockey / trainer */}
        <div style={{ fontSize: 12, color: "var(--gold)", opacity: 0.75, marginBottom: 2 }}>
          🏇 {horse.jockey}
        </div>
        <div style={{ fontSize: 12, color: "var(--gold)", opacity: 0.6, marginBottom: 8 }}>
          🎩 {horse.trainer}
        </div>

        {/* Participant badge */}
        {participant && (
          <div
            style={{
              background: "var(--green-light)",
              color: "var(--white)",
              fontFamily: "'VT323', monospace",
              fontSize: 15,
              padding: "2px 8px",
              display: "inline-block",
              marginBottom: result ? 6 : 0,
            }}
          >
            {participant}
          </div>
        )}

        {/* Result badge */}
        {result && (
          <div
            style={{
              background: poolRank === 0 ? "var(--gold)" : poolRank === 1 ? "#666" : poolRank === 2 ? "#cd7f32" : "var(--brown-light, #5a3e2b)",
              color: poolRank === 0 ? "var(--brown)" : "var(--white)",
              fontFamily: "'Bungee', sans-serif",
              fontSize: 12,
              padding: "2px 8px",
              display: "block",
              textAlign: "center",
              marginTop: participant ? 4 : 0,
            }}
          >
            {finishLabel(result.finish)} IN RACE
            {poolRank >= 0 && poolRank <= 2
              ? ` — POOL ${finishLabel(poolRank + 1)} +$${PAYOUTS[poolRank + 1]}`
              : ""}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Ad popup */}
      {showPopup && popupAd && <AdPopup ad={popupAd} onClose={dismissPopup} />}

      <div style={{ display: "flex", alignItems: "flex-start", maxWidth: 1400, margin: "0 auto", padding: "0 8px" }}>

        {/* Left sidebar */}
        <aside
          className="hidden lg:flex flex-col"
          style={{ width: 180, minWidth: 180, padding: "16px 8px 16px 0", flexShrink: 0 }}
        >
          {leftAds.map((ad, i) => <AdCard key={i} ad={ad} />)}
          {!ads.length && (
            <div style={{ color: "var(--gold)", opacity: 0.4, fontFamily: "'VT323', monospace", fontSize: 14, textAlign: "center" }}>
              LOADING ADS...
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, padding: "0 8px" }}>

          {/* ── HEADER ── */}
          <header style={{ textAlign: "center", padding: "20px 0 12px" }}>
            <div style={{ fontSize: 28, letterSpacing: "0.3em", marginBottom: 2 }}>🌹 🌹 🌹</div>
            <div
              style={{
                fontFamily: "'VT323', monospace",
                letterSpacing: "0.4em",
                color: "var(--gold)",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              WING NIGHT PRESENTS
            </div>
            <div
              style={{
                fontFamily: "'Bungee', sans-serif",
                fontSize: 36,
                color: "#cc2222",
                textShadow: "2px 2px 0 #000, -1px -1px 0 #000",
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              KENTUCKY DERBY
            </div>
            <div
              style={{
                fontFamily: "'Bungee', sans-serif",
                fontSize: 28,
                color: "var(--gold-bright)",
                textShadow: "1px 1px 0 #000",
                marginBottom: 14,
              }}
            >
              POOL 2026
            </div>

            {/* Pot + Clock */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <div
                style={{
                  border: "2px solid var(--gold)",
                  padding: "6px 16px",
                  fontFamily: "'VT323', monospace",
                  fontSize: 20,
                  color: "var(--gold-bright)",
                }}
              >
                💰 POT: ${TOTAL_POT}
              </div>
              <div
                style={{
                  border: "2px solid var(--blue, #4488cc)",
                  padding: "6px 16px",
                  fontFamily: "'VT323', monospace",
                  fontSize: 20,
                  color: "#88ccff",
                }}
              >
                🕐 ET: {time || "--:--:--"}
              </div>
            </div>

            {/* Winner banner */}
            {raceOver && (
              <div
                style={{
                  background: "var(--gold)",
                  color: "var(--brown)",
                  fontFamily: "'Bungee', sans-serif",
                  fontSize: 18,
                  padding: "8px 20px",
                  marginTop: 8,
                  display: "inline-block",
                  textShadow: "none",
                  boxShadow: "0 0 12px var(--gold-bright)",
                }}
              >
                🏆 {poolWin ? `${poolWin.horse} WINS THE POOL — ${participantFor(poolWin.horse)} TAKES $${PAYOUTS[1]}!!` : "RESULTS ENTERED"}
              </div>
            )}
          </header>

          {/* ── MARQUEE ── */}
          <div
            style={{
              background: "var(--red)",
              borderTop: "2px solid var(--gold)",
              borderBottom: "2px solid var(--gold)",
              padding: "6px 0",
              overflow: "hidden",
              marginBottom: 4,
            }}
          >
            <span
              className="marquee-text"
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 18,
                color: "var(--white)",
                letterSpacing: "0.05em",
              }}
            >
              {marqueeText}
            </span>
          </div>

          {/* ── ROTATING AD BANNER ── */}
          <RotatingBanner ads={ads} index={currentAdIndex} />

          {/* ── ODDS TIMESTAMP ── */}
          <div
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 13,
              color: "var(--gold)",
              opacity: 0.65,
              marginBottom: 8,
              letterSpacing: "0.05em",
            }}
          >
            ODDS UPDATED: {ODDS_LAST_UPDATED}
          </div>

          {/* ── TABS ── */}
          <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
            <button className={`tab-btn ${view === "pool" ? "active" : ""}`} onClick={() => setView("pool")}>
              POOL PICKS ({PARTICIPANTS.length})
            </button>
            <button className={`tab-btn ${view === "field" ? "active" : ""}`} onClick={() => setView("field")}>
              FULL FIELD ({HORSES.length})
            </button>
          </div>

          {/* ── HORSE CARDS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {displayHorses.map(renderHorseCard)}
          </div>

          {/* ── FINISH ORDER ── */}
          {results.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: "'Bungee', sans-serif",
                  color: "var(--gold)",
                  fontSize: 18,
                  borderBottom: "2px solid var(--gold)",
                  paddingBottom: 6,
                  marginBottom: 12,
                }}
              >
                📋 FINISH ORDER
              </div>
              {[...results].sort((a, b) => a.finish - b.finish).map((r) => {
                const participant = participantFor(r.horse);
                const pRank = poolResults.findIndex((p) => p.horse === r.horse);
                const payout = pRank >= 0 && pRank <= 2 ? PAYOUTS[pRank + 1] : null;
                const rowBg =
                  pRank === 0 ? "rgba(201,168,76,0.2)" :
                  pRank === 1 ? "rgba(170,170,170,0.15)" :
                  pRank === 2 ? "rgba(205,127,50,0.15)" :
                  "transparent";
                const horse = HORSES.find((h) => h.name === r.horse);
                return (
                  <div
                    key={r.finish}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      background: rowBg,
                      borderLeft: `4px solid ${pRank === 0 ? "var(--gold-bright)" : pRank === 1 ? "#aaa" : pRank === 2 ? "#cd7f32" : "transparent"}`,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: 20,
                        color: pRank === 0 ? "var(--gold-bright)" : pRank === 1 ? "#aaa" : pRank === 2 ? "#cd7f32" : "var(--cream)",
                        minWidth: 42,
                      }}
                    >
                      {finishLabel(r.finish)}
                    </span>
                    <span className="post-badge">{r.post}</span>
                    <span style={{ fontFamily: "'Bungee', sans-serif", color: "var(--gold-bright)", fontSize: 15 }}>
                      {r.horse}
                    </span>
                    {horse && (
                      <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: oddsColor(horse.oddsNum) }}>
                        {horse.odds}
                      </span>
                    )}
                    {participant && (
                      <span
                        style={{
                          background: "var(--green-light)",
                          color: "var(--white)",
                          fontFamily: "'VT323', monospace",
                          fontSize: 15,
                          padding: "1px 8px",
                        }}
                      >
                        {participant}
                      </span>
                    )}
                    {payout && (
                      <span style={{ fontFamily: "'Bungee', sans-serif", color: "var(--gold-bright)", fontSize: 14 }}>
                        +${payout}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PAYOUT DISPLAY ── */}
          {poolResults.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: "'Bungee', sans-serif",
                  color: "var(--gold)",
                  fontSize: 18,
                  borderBottom: "2px solid var(--gold)",
                  paddingBottom: 6,
                  marginBottom: 12,
                }}
              >
                💵 POOL PAYOUTS
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {([poolWin, poolPlace, poolShow] as (RaceResult | undefined)[]).map((r, idx) => {
                  if (!r) return null;
                  const participant = participantFor(r.horse);
                  if (!participant) return null;
                  const label = ["WIN", "PLACE", "SHOW"][idx];
                  const color = idx === 0 ? "var(--gold-bright)" : idx === 1 ? "#aaa" : "#cd7f32";
                  return (
                    <div
                      key={idx}
                      style={{
                        border: `2px solid ${color}`,
                        padding: "12px 20px",
                        textAlign: "center",
                        minWidth: 130,
                      }}
                    >
                      <div style={{ fontFamily: "'Bungee', sans-serif", color, fontSize: 14, marginBottom: 4 }}>
                        {label}
                      </div>
                      <div style={{ fontFamily: "'VT323', monospace", color: "var(--gold-bright)", fontSize: 32, lineHeight: 1, marginBottom: 4 }}>
                        ${PAYOUTS[idx + 1]}
                      </div>
                      <div style={{ fontFamily: "'Special Elite', serif", color: "var(--cream)", fontSize: 14 }}>
                        {participant}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--gold)", opacity: 0.7, marginTop: 2 }}>
                        ({r.horse} — {finishLabel(r.finish)} in race)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ADMIN ── */}
          <div style={{ marginBottom: 32 }}>
            {!showAdmin ? (
              <button
                onClick={() => setShowAdmin(true)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                  fontFamily: "'VT323', monospace",
                  fontSize: 14,
                  padding: "4px 12px",
                  cursor: "pointer",
                  opacity: 0.5,
                }}
              >
                ADMIN
              </button>
            ) : (
              <div className="admin-panel">
                <div
                  style={{
                    fontFamily: "'Bungee', sans-serif",
                    color: "var(--red-bright, #cc2222)",
                    fontSize: 16,
                    marginBottom: 12,
                  }}
                >
                  🔒 ADMIN PANEL
                </div>
                {!adminUnlocked ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      type="password"
                      placeholder="Password"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && adminCode === ADMIN_PASSWORD) setAdminUnlocked(true);
                      }}
                      style={{
                        background: "#000",
                        border: "1px solid var(--gold)",
                        color: "var(--cream)",
                        fontFamily: "'VT323', monospace",
                        fontSize: 18,
                        padding: "4px 10px",
                        width: 160,
                      }}
                    />
                    <button
                      onClick={() => { if (adminCode === ADMIN_PASSWORD) setAdminUnlocked(true); }}
                      style={{
                        background: "var(--red)",
                        color: "var(--white)",
                        border: "none",
                        fontFamily: "'Bungee', sans-serif",
                        fontSize: 12,
                        padding: "6px 14px",
                        cursor: "pointer",
                      }}
                    >
                      UNLOCK
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Current results */}
                    <div style={{ marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map((n) => {
                        const r = results.find((x) => x.finish === n);
                        return (
                          <div key={n} style={{ fontSize: 14, color: "var(--cream)", marginBottom: 2 }}>
                            <span style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: "var(--gold)", marginRight: 8 }}>
                              {finishLabel(n)}:
                            </span>
                            {r ? r.horse : <span style={{ opacity: 0.4 }}>—</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Set result */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                      <select
                        value={adminFinish}
                        onChange={(e) => setAdminFinish(Number(e.target.value))}
                        style={{ background: "#000", border: "1px solid var(--gold)", color: "var(--cream)", fontFamily: "'VT323', monospace", fontSize: 18, padding: "3px 8px" }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{finishLabel(n)} PLACE</option>
                        ))}
                      </select>
                      <select
                        value={adminHorse}
                        onChange={(e) => setAdminHorse(e.target.value)}
                        style={{ background: "#000", border: "1px solid var(--gold)", color: "var(--cream)", fontFamily: "'VT323', monospace", fontSize: 18, padding: "3px 8px", flex: 1, minWidth: 160 }}
                      >
                        {HORSES.sort((a, b) => a.post - b.post).map((h) => (
                          <option key={h.name} value={h.name}>#{h.post} {h.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={setResult}
                        style={{ background: "var(--green-light)", color: "var(--white)", border: "none", fontFamily: "'Bungee', sans-serif", fontSize: 12, padding: "6px 14px", cursor: "pointer" }}
                      >
                        SET RESULT
                      </button>
                    </div>

                    {/* Clear */}
                    <button
                      onClick={clearResults}
                      style={{ background: "var(--red)", color: "var(--white)", border: "none", fontFamily: "'Bungee', sans-serif", fontSize: 12, padding: "6px 14px", cursor: "pointer" }}
                    >
                      CLEAR ALL
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { setShowAdmin(false); setAdminUnlocked(false); setAdminCode(""); }}
                  style={{ marginTop: 12, background: "transparent", border: "none", color: "var(--gold)", opacity: 0.5, fontFamily: "'VT323', monospace", fontSize: 14, cursor: "pointer", display: "block" }}
                >
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside
          className="hidden lg:flex flex-col"
          style={{ width: 180, minWidth: 180, padding: "16px 0 16px 8px", flexShrink: 0 }}
        >
          {rightAds.map((ad, i) => <AdCard key={i} ad={ad} />)}
        </aside>
      </div>
    </div>
  );
}
