import { useState, useRef, useCallback, useEffect } from 'react'
import type { Project } from '../data/projects'

interface Props {
  projects: Project[]
  imageMap: Record<string, string>
}

export default function ProjectsGallery({ projects, imageMap }: Props) {
  const [selected, setSelected] = useState<Project | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollStart = useRef(0)
  const hasDragged = useRef(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  /* ─── Drag scroll via window listeners (sans setPointerCapture)
         → le click sur les boutons fonctionne normalement ─── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!galleryRef.current) return
    hasDragged.current = false
    startX.current = e.clientX
    scrollStart.current = galleryRef.current.scrollLeft

    const onMove = (ev: PointerEvent) => {
      if (!galleryRef.current) return
      const delta = startX.current - ev.clientX
      if (Math.abs(delta) > 8) {
        hasDragged.current = true
        setIsDragging(true)
      }
      if (hasDragged.current) {
        galleryRef.current.scrollLeft = scrollStart.current + delta
      }
    }

    const onUp = () => {
      setIsDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const handleCardClick = useCallback((project: Project) => {
    if (hasDragged.current) return
    setSelected(prev => prev?.id === project.id ? null : project)
  }, [])

  const closePanel = useCallback(() => setSelected(null), [])

  /* ─── Escape + focus trap ─── */
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel() }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, closePanel])

  /* ─── Empêche scroll body quand modal ouverte ─── */
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])

  return (
    <>
      {/* ── Galerie horizontale draggable ── */}
      <div
        ref={galleryRef}
        className="gallery"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        aria-label="Galerie de projets — glisser horizontalement"
        role="list"
      >
        {projects.map((project) => (
          <button
            key={project.id}
            className={`project-card card-${project.accent} ${selected?.id === project.id ? 'is-active' : ''}`}
            onClick={() => handleCardClick(project)}
            aria-pressed={selected?.id === project.id}
            aria-label={`Voir le détail du projet ${project.title}`}
            role="listitem"
          >
            {/* Zone image : 360×240 avec badges absolus */}
            <div className={`card-img card-img-${project.accent}`}>
              {imageMap[project.id] && (
                <img
                  src={imageMap[project.id]}
                  alt=""
                  className="card-img-photo"
                  loading="lazy"
                  aria-hidden="true"
                />
              )}
              <span className={`card-num card-num-${project.accent}`}>{project.index}</span>
              <div className={`year-badge year-badge-${project.accent}`}>
                <span className={`year-text year-text-${project.accent}`}>{project.year}</span>
              </div>
              <div className="card-img-glow" aria-hidden="true" />
              <div className="card-scanlines" aria-hidden="true" />
            </div>

            {/* Corps carte */}
            <div className="card-body">
              <h3 className="card-title">{project.title}</h3>
              <p className="card-desc">{project.description}</p>
              <div className="card-tags">
                {project.stack.slice(0, 3).map(tech => (
                  <span key={tech} className={`ctag ctag-${project.accent}`}>{tech}</span>
                ))}
              </div>
              <div className="card-cta-row">
                <span className={`card-cta card-cta-${project.accent}`}>VOIR LE DÉTAIL →</span>
              </div>
            </div>

            {/* Barre d'accent active */}
            <div className={`card-bar card-bar-${project.accent} ${selected?.id === project.id ? 'active' : ''}`} aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* ── Modal overlay SAO ── */}
      {selected && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) closePanel() }}
          role="dialog"
          aria-modal="true"
          aria-label={`Détail du projet ${selected.title}`}
        >
          <div className={`sao-panel sao-panel-${selected.accent}`}>

            {/* Header terminal */}
            <div className="sao-header">
              <span className="sao-path">
                PROJECTS://{selected.title.replace(/ /g, '_')}.EXE&nbsp;&nbsp;·&nbsp;&nbsp;SYS STATUS: LOADED
              </span>
              <button
                ref={closeRef}
                className="sao-close"
                onClick={closePanel}
                aria-label="Fermer le panneau de détail"
              >
                ✕&nbsp;&nbsp;CLOSE
              </button>
            </div>

            {/* Corps : image gauche + infos droite */}
            <div className="sao-body">

              {/* Image */}
              <div className={`sao-img sao-img-${selected.accent}`} aria-hidden="true">
                {imageMap[selected.id] && (
                  <img
                    src={imageMap[selected.id]}
                    alt=""
                    className="sao-img-photo"
                    aria-hidden="true"
                  />
                )}
                <div className="sao-img-glow" />
                <div className="sao-img-scanlines" />
                <span className="sao-img-watermark">{selected.index}</span>
              </div>

              {/* Info droite */}
              <div className="sao-info">

                {/* Numéro gradient 48px */}
                <div className="info-badge-row">
                  <span className={`info-num info-num-${selected.accent}`} aria-hidden="true">
                    {selected.index}
                  </span>
                </div>

                {/* Chip projet */}
                <div className={`info-chip info-chip-${selected.accent}`}>
                  PROJET {selected.index} · {selected.year}
                </div>

                {/* Titre */}
                <h3 className="info-title">{selected.title}</h3>

                {/* Description */}
                <p className="info-desc">{selected.fullDescription}</p>

                {/* Stack tags */}
                <div className="info-stack">
                  {selected.stack.map(tech => (
                    <span key={tech} className={`stag stag-${selected.accent}`}>{tech}</span>
                  ))}
                </div>

                {/* Boutons */}
                <div className="info-actions">
                  <a
                    href={selected.liveLink}
                    className={`btn-live btn-live-${selected.accent}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir ${selected.title} en live (ouvre un nouvel onglet)`}
                  >
                    VOIR EN LIVE →
                  </a>
                  {selected.codeLink && (
                    <a
                      href={selected.codeLink}
                      className="btn-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Voir le code source de ${selected.title} (ouvre un nouvel onglet)`}
                    >
                      {'< SOURCE CODE />'}
                    </a>
                  )}
                </div>

                {/* Métriques */}
                <div className="info-metrics">
                  <div className="metric">
                    <span className="metric-label">DURÉE</span>
                    <span className="metric-value">{selected.duration}</span>
                  </div>
                  <div className="metric-sep" aria-hidden="true" />
                  <div className="metric">
                    <span className="metric-label">RÔLE</span>
                    <span className="metric-value">{selected.role}</span>
                  </div>
                  <div className="metric-sep" aria-hidden="true" />
                  <div className="metric">
                    <span className="metric-label">PERF</span>
                    <span className={`metric-value metric-perf-${selected.accent}`}>{selected.perf}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ─── Galerie ─── */
        .gallery {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 0 clamp(24px, 8.3vw, 120px) 40px;
          scroll-snap-type: x mandatory;
          scroll-padding-left: clamp(24px, 8.3vw, 120px);
          scrollbar-width: none;
          user-select: none;
          -webkit-overflow-scrolling: touch;
        }
        .gallery::-webkit-scrollbar { display: none; }

        /* ─── Carte projet ─── */
        .project-card {
          flex: 0 0 360px;
          height: 560px;
          display: flex;
          flex-direction: column;
          border-radius: 6px;
          overflow: hidden;
          scroll-snap-align: start;
          cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.25s ease;
          text-align: left;
          padding: 0;
          position: relative;
        }

        .card-cyan {
          background: linear-gradient(180deg, #0A1E2E 0%, #060B18 100%);
          border: 1px solid rgba(0,229,255,0.31);
        }
        .card-purple {
          background: linear-gradient(180deg, #120A20 0%, #060B18 100%);
          border: 1px solid rgba(168,85,247,0.188);
        }
        .card-cyan:hover, .card-cyan.is-active {
          border-color: rgba(0,229,255,0.55);
          box-shadow: 0 0 32px rgba(0,229,255,0.1);
          transform: translateY(-4px);
        }
        .card-purple:hover, .card-purple.is-active {
          border-color: rgba(168,85,247,0.5);
          box-shadow: 0 0 32px rgba(168,85,247,0.12);
          transform: translateY(-4px);
        }

        /* ─── Zone image 360×240 ─── */
        .card-img {
          position: relative;
          width: 360px;
          height: 240px;
          flex-shrink: 0;
          overflow: hidden;
        }
        .card-img-cyan   { background: linear-gradient(160deg, #0A1F30 0%, #050E1A 100%); }
        .card-img-purple { background: linear-gradient(160deg, #150820 0%, #08051A 100%); }

        .card-img-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          opacity: 0.85;
        }

        .card-img-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 80%, rgba(0,229,255,0.12), transparent 65%);
        }
        .card-img-purple .card-img-glow {
          background: radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.14), transparent 65%);
        }
        .card-scanlines {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            180deg, transparent 0px, transparent 4px,
            rgba(0,229,255,0.025) 4px, rgba(0,229,255,0.025) 5px
          );
        }

        /* Numéro flottant haut-gauche */
        .card-num {
          position: absolute;
          top: 16px; left: 16px;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.2em;
        }
        .card-num-cyan   { color: #00E5FF; }
        .card-num-purple { color: #A855F7; }

        /* Badge année haut-droite */
        .year-badge {
          position: absolute;
          top: 16px; right: 16px;
          padding: 4px 10px;
          border-radius: 3px;
        }
        .year-badge-cyan   { background: rgba(0,229,255,0.288); }
        .year-badge-purple { background: rgba(168,85,247,0.388); }

        .year-text {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
        }
        .year-text-cyan   { color: #00E5FF; }
        .year-text-purple { color: #A855F7; }

        /* ─── Corps carte ─── */
        .card-body {
          padding: 16px 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .card-title {
          font-family: var(--font-geist);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #E8F4FD;
          line-height: 1.1;
        }

        .card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #6B8BAF;
          line-height: 1.6;
        }

        .card-tags {
          display: flex; flex-wrap: wrap; gap: 7px;
        }
        .ctag {
          padding: 3px 9px;
          border-radius: 3px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.05em;
        }
        .ctag-cyan {
          background: rgba(0,229,255,0.07);
          border: 1px solid rgba(0,229,255,0.22);
          color: #00E5FF;
        }
        .ctag-purple {
          background: rgba(168,85,247,0.08);
          border: 1px solid rgba(168,85,247,0.22);
          color: #A855F7;
        }

        .card-cta-row {
          margin-top: auto;
        }
        .card-cta {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          opacity: 0.55;
          transition: opacity 0.2s;
        }
        .project-card:hover .card-cta { opacity: 1; }
        .card-cta-cyan   { color: #00E5FF; }
        .card-cta-purple { color: #A855F7; }

        /* Barre d'accent en bas */
        .card-bar {
          height: 2px;
          background: transparent;
          flex-shrink: 0;
          transition: background 0.3s;
        }
        .card-bar.active.card-bar-cyan {
          background: #00E5FF;
          box-shadow: 0 0 8px #00E5FF;
        }
        .card-bar.active.card-bar-purple {
          background: #A855F7;
          box-shadow: 0 0 8px #A855F7;
        }

        /* ─── Modal backdrop ─── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(4, 8, 20, 0.82);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: bdFadeIn 0.25s ease both;
        }
        @keyframes bdFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ─── SAO Panel (modal) ─── */
        .sao-panel {
          width: min(1200px, 100%);
          max-height: calc(100vh - 48px);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(0,229,255,0.31);
          background: linear-gradient(145deg, #0B1830 0%, #07101E 100%);
          box-shadow: 0 0 50px rgba(0,229,255,0.125), 0 0 0 1px rgba(0,229,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: panelIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
          display: flex;
          flex-direction: column;
        }
        .sao-panel-purple {
          border-color: rgba(168,85,247,0.31);
          box-shadow: 0 0 50px rgba(168,85,247,0.1), 0 0 0 1px rgba(168,85,247,0.06);
        }
        @keyframes panelIn {
          from { opacity: 0; transform: scale(0.96) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Header */
        .sao-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 24px;
          flex-shrink: 0;
          background: rgba(0,229,255,0.19);
          border-bottom: 1px solid rgba(0,229,255,0.31);
        }
        .sao-panel-purple .sao-header {
          background: rgba(168,85,247,0.12);
          border-bottom-color: rgba(168,85,247,0.25);
        }

        .sao-path {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #00E5FF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sao-panel-purple .sao-path { color: #A855F7; }

        .sao-close {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #FF6680;
          background: rgba(255,54,96,0.125);
          border: 1px solid rgba(255,54,96,0.25);
          border-radius: 3px;
          cursor: pointer;
          flex-shrink: 0;
          margin-left: 16px;
          transition: background 0.2s, border-color 0.2s;
        }
        .sao-close:hover {
          background: rgba(255,54,96,0.22);
          border-color: rgba(255,54,96,0.5);
        }

        /* Grille image|info */
        .sao-body {
          display: grid;
          grid-template-columns: 520px 1fr;
          flex: 1;
          overflow: hidden;
        }

        /* Zone image */
        .sao-img {
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(0,229,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sao-img-cyan   { background: linear-gradient(160deg, #061628 0%, #040C18 100%); }
        .sao-img-purple { background: linear-gradient(160deg, #0E0618 0%, #060410 100%); border-right-color: rgba(168,85,247,0.08); }

        .sao-img-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          opacity: 1;
        }

        .sao-img-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 60%, rgba(0,229,255,0.1), transparent 65%);
        }
        .sao-img-purple .sao-img-glow {
          background: radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.12), transparent 65%);
        }
        .sao-img-scanlines {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            180deg, transparent 0px, transparent 3px,
            rgba(0,229,255,0.03) 3px, rgba(0,229,255,0.03) 4px
          );
        }
        .sao-img-watermark {
          font-family: var(--font-mono);
          font-size: 140px;
          font-weight: 700;
          color: rgba(255,255,255,0.025);
          letter-spacing: -0.06em;
          user-select: none;
          position: relative;
          z-index: 1;
        }

        /* Zone info */
        .sao-info {
          padding: 28px 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .info-badge-row { display: flex; align-items: center; }

        .info-num {
          font-family: var(--font-mono);
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .info-num-cyan {
          background: linear-gradient(135deg, #00E5FF 0%, rgba(0,229,255,0.188) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .info-num-purple {
          background: linear-gradient(135deg, #A855F7 0%, rgba(168,85,247,0.188) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .info-chip {
          display: inline-flex;
          padding: 5px 12px;
          border-radius: 3px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.2em;
          width: fit-content;
        }
        .info-chip-cyan {
          background: rgba(0,229,255,0.188);
          border: 1px solid rgba(0,229,255,0.314);
          color: #00E5FF;
        }
        .info-chip-purple {
          background: rgba(168,85,247,0.188);
          border: 1px solid rgba(168,85,247,0.314);
          color: #A855F7;
        }

        .info-title {
          font-family: var(--font-geist);
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #E8F4FD;
          line-height: 1.05;
        }

        .info-desc {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: #6B8BAF;
          line-height: 1.65;
        }

        .info-stack { display: flex; flex-wrap: wrap; gap: 8px; }
        .stag {
          padding: 5px 12px;
          border-radius: 3px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
        }
        .stag-cyan {
          background: transparent;
          border: 1px solid rgba(0,229,255,0.31);
          color: #00E5FF;
        }
        .stag-purple {
          background: transparent;
          border: 1px solid rgba(168,85,247,0.31);
          color: #A855F7;
        }

        .info-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-live {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.1em;
          font-weight: 600;
          border-radius: 4px;
          text-decoration: none;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .btn-live-cyan {
          background: #00E5FF;
          color: #040C18;
          box-shadow: 0 0 16px rgba(0,229,255,0.314);
        }
        .btn-live-purple {
          background: #A855F7;
          color: #fff;
          box-shadow: 0 0 16px rgba(168,85,247,0.3);
        }
        .btn-live:hover { transform: translateY(-1px); }
        .btn-live-cyan:hover   { box-shadow: 0 0 28px rgba(0,229,255,0.5); }
        .btn-live-purple:hover { box-shadow: 0 0 28px rgba(168,85,247,0.5); }

        .btn-code {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #7A9BBF;
          background: transparent;
          border: 1px solid #1B3050;
          border-radius: 4px;
          text-decoration: none;
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-code:hover { color: #E8F4FF; border-color: rgba(0,229,255,0.31); }

        .info-metrics {
          display: flex;
          align-items: center;
          gap: 32px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: auto;
        }

        .metric { display: flex; flex-direction: column; gap: 4px; }
        .metric-label {
          font-family: var(--font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #3D5A7A;
        }
        .metric-value {
          font-family: var(--font-geist);
          font-size: 14px;
          font-weight: 600;
          color: #E8F4FF;
        }
        .metric-perf-cyan   { color: #00E5FF; }
        .metric-perf-purple { color: #A855F7; }

        .metric-sep {
          width: 1px; height: 32px;
          background: rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        /* ─── Mobile ─── */
        @media (max-width: 768px) {
          .gallery { padding: 0 24px 24px; gap: 16px; }
          .project-card { flex: 0 0 300px; height: auto; }
          .card-img { width: 300px; height: 200px; }
          .modal-backdrop { padding: 16px; align-items: flex-end; }
          .sao-panel { max-height: 85vh; }
          .sao-body { grid-template-columns: 1fr; }
          .sao-img { display: none; }
          .sao-info { padding: 20px 24px; gap: 12px; }
          .info-title { font-size: 28px; }
          .info-num  { font-size: 36px; }
        }
      `}</style>
    </>
  )
}
