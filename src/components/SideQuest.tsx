import { useState, useRef, useEffect, useCallback } from 'react'

type TermState = 'idle' | 'booting' | 'active'

const BOOT_LINES = [
  { text: '> CONNECTING TO game.yanng.xyz...', delay: 400 },
  { text: '> LOADING GAME ASSETS...', delay: 900 },
  { text: '> OK — LAUNCHING  ✓', delay: 1500 },
]

export default function SideQuest() {
  const [termState, setTermState] = useState<TermState>('idle')
  const [bootLines, setBootLines] = useState<string[]>([])
  const [showIframe, setShowIframe] = useState(false)
  const [animReady, setAnimReady] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(0)

  const idleTermRef = useRef<HTMLDivElement>(null)
  const startRectRef = useRef<DOMRect | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const handleLaunch = useCallback(() => {
    if (termState !== 'idle') return
    // Sur mobile : ouvrir dans un nouvel onglet (meilleure expérience tactile)
    if (window.innerWidth < 768) {
      window.open('https://game.yanng.xyz', '_blank', 'noopener,noreferrer')
      return
    }
    if (!idleTermRef.current) return
    startRectRef.current = idleTermRef.current.getBoundingClientRect()
    setTermState('booting')
    setBootLines([])
    setShowIframe(false)
    setAnimReady(false)
    setOverlayOpacity(0)
  }, [termState])

  const handleClose = useCallback(() => {
    clearTimers()
    setShowIframe(false)
    setOverlayOpacity(0)
    setIsClosing(true)
    setTimeout(() => {
      setTermState('idle')
      setBootLines([])
      setIsClosing(false)
      setAnimReady(false)
    }, 650)
  }, [])

  useEffect(() => {
    if (termState !== 'booting') return

    // Double RAF: paint "at original position" first, then trigger transition
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimReady(true)
        setOverlayOpacity(0.85)
      })
    })

    // Typewriter boot sequence
    BOOT_LINES.forEach(({ text, delay }) => {
      const t = setTimeout(() => setBootLines(prev => [...prev, text]), delay)
      timersRef.current.push(t)
    })

    // Show iframe after boot
    const t = setTimeout(() => {
      setTermState('active')
      setShowIframe(true)
    }, 2100)
    timersRef.current.push(t)

    return () => {
      cancelAnimationFrame(raf)
      clearTimers()
    }
  }, [termState])

  // CSS FLIP: 3 états → initial (snap), agrandi (transition open), fermeture (transition inverse)
  const getExpandedStyle = (): React.CSSProperties => {
    const rect = startRectRef.current
    if (!rect) return {}

    const ease = 'cubic-bezier(0.22,1,0.36,1)'
    const transition = `top 0.55s ${ease}, left 0.55s ${ease}, width 0.55s ${ease}, height 0.55s ${ease}`

    // Fermeture : animer EN RETOUR vers les coordonnées d'origine avec transition
    if (isClosing) {
      return {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 1001,
        transition,
      }
    }

    // Avant le double-RAF : snap sans transition à la position d'origine
    if (!animReady) {
      return {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 1001,
        transition: 'none',
      }
    }

    // Agrandi : animer vers le centre
    const targetW = Math.min(window.innerWidth * 0.85, 1200)
    const targetH = Math.min(window.innerHeight * 0.85, 800)
    const targetT = (window.innerHeight - targetH) / 2
    const targetL = (window.innerWidth - targetW) / 2

    return {
      position: 'fixed',
      top: targetT,
      left: targetL,
      width: targetW,
      height: targetH,
      zIndex: 1001,
      transition,
    }
  }

  const isExpanded = termState === 'booting' || termState === 'active' || isClosing

  return (
    <>
      <section id="side-quest" className="sq-section" aria-labelledby="sq-title">
        <div className="sq-bg" aria-hidden="true">
          <div className="sq-halo sq-halo-cyan" />
          <div className="sq-halo sq-halo-purple" />
        </div>

        <div className="sq-inner">
          {/* ── Colonne gauche ── */}
          <div className={`sq-left${isExpanded ? ' sq-left-hidden' : ''}`}>
            <div className="sq-badge" aria-label="Side Quest débloqué">
              <span className="sq-badge-icon" aria-hidden="true">▶</span>
              <span className="sq-badge-text">SIDE QUEST · UNLOCKED</span>
            </div>

            <div className="sq-sep" aria-hidden="true" />

            <h2 id="sq-title" className="sq-title">
              Le jeu que j'ai<br />fait
            </h2>

            <p className="sq-desc">
              Entre deux missions freelance, les mains créatives ne s'arrêtent jamais.<br />
              Ce projet n'est pas dans mes travaux — c'est un plaisir que je partage avec vous.
            </p>

            <div className="sq-cta-row">
              <button
                className="sq-btn-launch"
                onClick={handleLaunch}
                aria-label="Lancer le jeu dans le terminal"
              >
                <span aria-hidden="true">▶</span>
                LANCER LE JEU
              </button>
              <a
                href="https://game.yanng.xyz"
                className="sq-btn-ext"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir game.yanng.xyz dans un nouvel onglet (ouvre un nouvel onglet)"
              >
                game.yanng.xyz ↗
              </a>
            </div>
          </div>

          {/* ── Terminal idle ── */}
          <div
            ref={idleTermRef}
            className={`sq-terminal${isExpanded ? ' sq-terminal-ghost' : ''}`}
            aria-hidden={isExpanded}
          >
            <TerminalHeader url="game.yanng.xyz — idle" />

            <div className="sq-disc-screen">
              <span className="sq-disc-icon" aria-hidden="true">◈</span>
              <div className="sq-disc-status">
                <span className="sq-disc-label">SIG_IDLE · AWAITING LAUNCH</span>
                <span className="sq-cursor" aria-hidden="true">&gt;&nbsp;_</span>
              </div>
              <div className="sq-echo-lines" aria-hidden="true">
                <span>last session: null</span>
                <span>game.yanng.xyz: unreachable</span>
                <span>awaiting launch signal...</span>
              </div>
              <div className="sq-scanlines" aria-hidden="true" />
            </div>

            <div className="sq-term-footer">
              <div className="sq-footer-left">
                <span className="sq-footer-sup">STATUS · OFFLINE</span>
                <span className="sq-footer-main">[ AWAITING LAUNCH ]</span>
              </div>
              <div className="sq-badge-idle">
                <span className="sq-dot" aria-hidden="true" />
                IDLE
              </div>
            </div>

            <Brackets />
          </div>
        </div>
      </section>

      {/* ── Overlay ── */}
      {isExpanded && (
        <div
          className="sq-overlay"
          onClick={handleClose}
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {/* ── Terminal agrandi (FLIP) ── */}
      {isExpanded && (
        <div
          className="sq-terminal sq-terminal-exp"
          style={getExpandedStyle()}
          role="dialog"
          aria-modal="true"
          aria-label="Terminal — game.yanng.xyz"
        >
          <TerminalHeader
            url={`game.yanng.xyz — ${termState === 'active' ? 'connected' : 'booting...'}`}
            expanded
            onClose={handleClose}
          />

          {/* Boot zone (80px, toujours visible pendant booting + active) */}
          {bootLines.length > 0 && (
            <div className="sq-boot-zone">
              {bootLines.map((line, i) => (
                <div key={i} className={`sq-boot-line${line.includes('✓') ? ' sq-boot-ok' : ''}`}>
                  {line}
                </div>
              ))}
              {termState === 'booting' && (
                <span className="sq-cursor" aria-hidden="true">&gt;&nbsp;_</span>
              )}
            </div>
          )}

          {/* Iframe */}
          <iframe
            src={showIframe ? 'https://game.yanng.xyz' : undefined}
            className={`sq-iframe${showIframe ? ' sq-iframe-visible' : ''}`}
            title="game.yanng.xyz"
            allow="gamepad"
            aria-hidden={!showIframe}
          />

          <Brackets size={16} />
        </div>
      )}

      <style>{`
        /* ─── Section ─── */
        .sq-section {
          position: relative;
          padding: 80px clamp(24px, 8.3vw, 120px);
          background: linear-gradient(180deg, #050D1A 0%, #07101E 100%);
          border-top: 1px solid #1B3050;
          border-bottom: 1px solid #1B3050;
          overflow: hidden;
        }
        .sq-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            180deg,
            transparent 0px, transparent 29px,
            rgba(0,229,255,0.035) 29px, rgba(0,229,255,0.035) 30px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Halos */
        .sq-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .sq-halo { position: absolute; border-radius: 50%; }
        .sq-halo-cyan {
          width: 520px; height: 420px; top: 60px; left: -80px;
          background: radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 70%);
          filter: blur(80px);
        }
        .sq-halo-purple {
          width: 600px; height: 420px; top: 120px; right: -80px;
          background: radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 70%);
          filter: blur(90px);
        }

        /* Inner layout */
        .sq-inner {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 80px;
          max-width: 1200px;
        }

        /* ─── Left column ─── */
        .sq-left {
          flex: 0 0 580px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transition: opacity 0.3s ease;
        }
        .sq-left-hidden { opacity: 0; pointer-events: none; }

        .sq-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0,229,255,0.07);
          border: 1px solid rgba(0,229,255,0.31);
          border-radius: 4px;
          width: fit-content;
          box-shadow: 0 0 12px rgba(0,229,255,0.19);
        }
        .sq-badge-icon, .sq-badge-text {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #00E5FF;
        }

        .sq-sep {
          width: 60px; height: 2px;
          background: linear-gradient(90deg, #00E5FF 0%, #A855F7 100%);
          border-radius: 1px;
        }

        .sq-title {
          font-family: var(--font-geist);
          font-size: clamp(32px, 3.2vw, 44px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #E8F4FD;
        }

        .sq-desc {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.65;
          color: #6B8BAF;
          max-width: 580px;
        }

        .sq-cta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .sq-btn-launch {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          font-family: var(--font-geist);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #060B18;
          background: linear-gradient(135deg, #00E5FF 0%, #0BB5D4 100%);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 0 28px rgba(0,229,255,0.67);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .sq-btn-launch:hover {
          box-shadow: 0 0 44px rgba(0,229,255,0.9);
          transform: translateY(-1px);
        }
        .sq-btn-ext {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: #6B8BAF;
          text-decoration: none;
          border: 1px solid #1B3050;
          border-radius: 6px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .sq-btn-ext:hover { color: #E8F4FF; border-color: rgba(0,229,255,0.31); }

        /* ─── Terminal (commun idle + expanded) ─── */
        .sq-terminal {
          flex: 0 0 520px;
          height: 420px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #050D1A 0%, #030810 100%);
          border: 1px solid rgba(0,229,255,0.31);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(0,229,255,0.21);
          position: relative;
        }
        .sq-terminal-ghost { visibility: hidden; }
        .sq-terminal-exp   { flex: none; height: auto; }

        /* Header */
        .sq-term-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 16px;
          flex-shrink: 0;
          background: rgba(0,229,255,0.03);
          border-bottom: 1px solid rgba(0,229,255,0.31);
        }
        .sq-term-header-exp { height: 52px; padding: 0 24px; }

        .sq-tl-row { display: flex; gap: 6px; align-items: center; }
        .sq-tl { width: 10px; height: 10px; border-radius: 50%; opacity: 0.7; flex-shrink: 0; }
        .sq-tl-red    { background: #FF5F57; }
        .sq-tl-yellow { background: #FEBC2E; }
        .sq-tl-green  { background: #28C840; }

        .sq-term-url {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #3D5A7A;
          flex: 1;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 12px;
        }
        .sq-term-lock { font-size: 11px; color: #6B8BAF; flex-shrink: 0; }

        .sq-btn-close {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #FF6680;
          background: rgba(255,54,96,0.125);
          border: 1px solid rgba(255,54,96,0.25);
          border-radius: 3px;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .sq-btn-close:hover {
          background: rgba(255,54,96,0.22);
          border-color: rgba(255,54,96,0.5);
        }

        /* Disconnected screen */
        .sq-disc-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #020810;
          position: relative;
          overflow: hidden;
        }
        .sq-disc-icon {
          font-family: var(--font-mono);
          font-size: 28px;
          color: #1B3050;
        }
        .sq-disc-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .sq-disc-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #3D5A7A;
        }
        .sq-cursor {
          font-family: var(--font-mono);
          font-size: 14px;
          color: #00E5FF;
          opacity: 0.5;
          animation: blink 1.2s step-end infinite;
        }
        .sq-echo-lines {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          opacity: 0.5;
        }
        .sq-echo-lines span {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          color: #6B8BAF;
        }
        .sq-scanlines {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            180deg, transparent 0px, transparent 3px,
            rgba(0,229,255,0.025) 3px, rgba(0,229,255,0.025) 4px
          );
          pointer-events: none;
        }

        /* Footer */
        .sq-term-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          padding: 0 20px;
          flex-shrink: 0;
          border-top: 1px solid rgba(0,229,255,0.31);
        }
        .sq-footer-left  { display: flex; flex-direction: column; gap: 3px; }
        .sq-footer-sup {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #6B8BAF;
        }
        .sq-footer-main {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          color: #00E5FF;
        }
        .sq-badge-idle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(27,48,80,0.19);
          border: 1px solid #1B3050;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #6B8BAF;
        }
        .sq-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1B3050;
          flex-shrink: 0;
        }

        /* Corner brackets */
        .sq-bracket {
          position: absolute;
          border-color: rgba(0,229,255,0.5);
          border-style: solid;
          z-index: 3;
        }

        /* Boot zone */
        .sq-boot-zone {
          padding: 12px 24px;
          background: #020810;
          border-bottom: 1px solid #0A1628;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex-shrink: 0;
        }
        .sq-boot-line {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.04em;
          color: #00FF88;
          animation: typeIn 0.12s ease both;
        }
        .sq-boot-ok { color: #22c55e; }

        /* Iframe */
        .sq-iframe {
          flex: 1;
          border: none;
          width: 100%;
          min-height: 0;
          background: #020810;
          opacity: 0;
          transition: opacity 0.45s ease 0.1s;
        }
        .sq-iframe-visible { opacity: 1; }

        /* Overlay */
        .sq-overlay {
          position: fixed;
          inset: 0;
          background: #060B18;
          z-index: 1000;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }

        @keyframes typeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ─── Mobile ─── */
        @media (max-width: 1100px) {
          .sq-inner { flex-direction: column; gap: 40px; }
          .sq-left  { flex: none; max-width: 100%; }
          .sq-terminal { flex: none; width: 100%; max-width: 520px; align-self: center; }
        }
        @media (max-width: 480px) {
          .sq-btn-launch { padding: 14px 24px; font-size: 13px; }
          .sq-terminal { height: 360px; }
        }
      `}</style>
    </>
  )
}

/* ── Helpers ── */

function TerminalHeader({
  url,
  expanded = false,
  onClose,
}: {
  url: string
  expanded?: boolean
  onClose?: () => void
}) {
  return (
    <div className={`sq-term-header${expanded ? ' sq-term-header-exp' : ''}`}>
      <div className="sq-tl-row" aria-hidden="true">
        <span className="sq-tl sq-tl-red" />
        <span className="sq-tl sq-tl-yellow" />
        <span className="sq-tl sq-tl-green" />
      </div>
      <span className="sq-term-url">◉&nbsp;&nbsp;{url}</span>
      {expanded && onClose ? (
        <button className="sq-btn-close" onClick={onClose} aria-label="Fermer le jeu">
          ✕&nbsp;&nbsp;FERMER
        </button>
      ) : (
        <span className="sq-term-lock" aria-hidden="true">🔒</span>
      )}
    </div>
  )
}

function Brackets({ size = 12 }: { size?: number }) {
  const s = size
  const w = `${s}px`
  const h = `${s}px`
  const base: React.CSSProperties = {
    position: 'absolute',
    width: w,
    height: h,
    borderColor: 'rgba(0,229,255,0.5)',
    borderStyle: 'solid',
    zIndex: 3,
  }
  const offset = size === 16 ? 8 : 8
  const top = size === 16 ? 60 : 48
  const bot = size === 16 ? 8 : 8
  return (
    <>
      <div aria-hidden="true" style={{ ...base, top, left: offset, borderWidth: '1.5px 0 0 1.5px' }} />
      <div aria-hidden="true" style={{ ...base, top, right: offset, borderWidth: '1.5px 1.5px 0 0' }} />
      <div aria-hidden="true" style={{ ...base, bottom: bot, left: offset, borderWidth: '0 0 1.5px 1.5px' }} />
      <div aria-hidden="true" style={{ ...base, bottom: bot, right: offset, borderWidth: '0 1.5px 1.5px 0' }} />
    </>
  )
}
