import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   SCREENSAVER v3 – Optimizado para tablet
   
   Principios de rendimiento:
   - Todas las animaciones en loop usan CSS @keyframes
     (se ejecutan en el compositor thread, no bloquean el main thread)
   - Framer Motion se usa SOLO para enter/exit transitions
   - Solo se animan propiedades "compositor-only": transform y opacity
   - Cero uso de filter, box-shadow, o blur animados
   - Mínimos elementos DOM
───────────────────────────────────────────── */

/* Inline CSS for all looping animations – avoids Framer Motion overhead */
const screensaverCSS = `
@keyframes ss-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
}
@keyframes ss-shimmer {
  0% { background-position: -200% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes ss-pulse-ring {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
@keyframes ss-glow-breathe {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(2.2); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(2.6); }
}
@keyframes ss-dot-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes ss-particle-drift {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  15% { opacity: var(--p-opacity); }
  50% { transform: translate(var(--p-dx), var(--p-dy)) scale(1); }
  85% { opacity: var(--p-opacity); }
  100% { transform: translate(calc(var(--p-dx) * 1.3), calc(var(--p-dy) * 1.8)) scale(0.3); opacity: 0; }
}
@keyframes ss-subtitle-fade {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.9; }
}
@keyframes ss-wave-sweep {
  0% { transform: translateY(-30%); }
  100% { transform: translateY(120%); }
}
@keyframes ss-wave-slide {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes ss-ripple-expand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
`;

/* ─────────────────────────────────────────────
   Lightweight Particles – CSS only, 10 elements
───────────────────────────────────────────── */
function Particles() {
  const particles = useRef(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60,
      size: 2 + Math.random() * 3,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 6,
      dx: `${(Math.random() - 0.5) * 40}px`,
      dy: `${-(20 + Math.random() * 50)}px`,
      opacity: 0.25 + Math.random() * 0.45,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `rgba(100, 210, 255, ${p.opacity})`,
            '--p-dx': p.dx,
            '--p-dy': p.dy,
            '--p-opacity': p.opacity,
            animation: `ss-particle-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Screensaver Component
───────────────────────────────────────────── */
export default function Screensaver({ onWake }) {
  const [visible, setVisible] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const visibleRef = useRef(false);
  const isPreviewMode = new URLSearchParams(window.location.search).get('screensaver') === '1';
  const SCREENSAVER_DELAY = isPreviewMode ? 3000 : 3 * 60 * 1000;

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      visibleRef.current = true;
      setRipple(null);
      setExiting(false);
      setVisible(true);
    }, SCREENSAVER_DELAY);
  }, [SCREENSAVER_DELAY]);

  const handleActivity = useCallback(() => {
    if (!visibleRef.current) {
      startTimer();
    }
  }, [startTimer]);

  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    startTimer();
    return () => {
      clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [handleActivity, startTimer]);

  const handleTouch = useCallback((e) => {
    if (!visibleRef.current || exiting) return;
    visibleRef.current = false;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e.clientX !== undefined) { x = e.clientX; y = e.clientY; }
    else if (e.touches?.length > 0) { x = e.touches[0].clientX; y = e.touches[0].clientY; }

    setRipple({ x, y, key: Date.now() });
    setExiting(true);

    // Let ripple play, then fade out cleanly
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      onWake?.();
      startTimer();
    }, 600);
  }, [onWake, startTimer, exiting]);

  // Determine the max dimension for the ripple circle
  const maxDim = typeof window !== 'undefined'
    ? Math.max(window.innerWidth, window.innerHeight) * 2.5
    : 3000;

  return (
    <>
      {/* Inject CSS keyframes once */}
      <style>{screensaverCSS}</style>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="screensaver"
            className="fixed inset-0 z-[9999] overflow-hidden cursor-pointer select-none"
            style={{
              background: 'radial-gradient(circle at center, #1a2a44 0%, #08111e 50%, #000000 100%)',
              willChange: 'opacity',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
            transition={{ duration: 1, ease: 'easeOut' }}
            onPointerDown={handleTouch}
          >

            {/* Click ripple – single expanding circle via CSS animation */}
            {ripple && (
              <div
                key={ripple.key}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: maxDim,
                  height: maxDim,
                  border: '3px solid rgba(100,210,255,0.5)',
                  animation: 'ss-ripple-expand 1s ease-out forwards',
                  willChange: 'transform, opacity',
                }}
              />
            )}

            {/* Particles – pure CSS */}
            <Particles />

            {/* Subtle wave light sweep – CSS only, no SVG, no blur */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                height: '12vh',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(43,180,255,0.08) 40%, rgba(100,230,255,0.12) 50%, rgba(43,180,255,0.08) 60%, transparent 100%)',
                animation: 'ss-wave-sweep 10s linear infinite',
                willChange: 'transform',
              }}
            />

            {/* Main content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">

              {/* CAUCE Logo */}
              <div
                className="relative"
                style={{ animation: 'ss-float 5s ease-in-out infinite' }}
              >
                {/* Glow halo – static radial, only opacity breathes via CSS */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: '300%',
                    height: '300%',
                    background: 'radial-gradient(circle, rgba(43,129,144,0.5) 0%, rgba(0,80,160,0.2) 50%, transparent 75%)',
                    animation: 'ss-glow-breathe 4s ease-in-out infinite',
                    willChange: 'transform, opacity',
                  }}
                />

                <img
                  src="/logo/logo cauce blanco completo.png"
                  alt="CAUCE"
                  className="relative z-10"
                  style={{
                    width: 'clamp(180px, 22vw, 320px)',
                    filter: 'drop-shadow(0 0 20px rgba(43,200,255,0.45))',
                  }}
                />
              </div>

              {/* Thin horizontal divider */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              >
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-cyan-400/50" />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  style={{ animation: 'ss-dot-pulse 2s ease-in-out infinite' }}
                />
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-cyan-400/50" />
              </motion.div>

              {/* "INICIA AQUÍ" text */}
              <div className="text-center">
                <h1
                  className="font-black uppercase tracking-[0.25em] leading-none"
                  style={{
                    fontSize: 'clamp(2.2rem, 5.5vw, 5rem)',
                    background: 'linear-gradient(90deg, #7de8ff, #2bb8d4, #ffffff, #7de8ff, #2bb8d4)',
                    backgroundSize: '300% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'ss-shimmer 5s linear infinite',
                  }}
                >
                  INICIA AQUÍ
                </h1>

                <p
                  className="mt-4 font-mono tracking-[0.4em] uppercase text-cyan-300/60 text-sm"
                  style={{ animation: 'ss-subtitle-fade 3s ease-in-out infinite' }}
                >
                  Toca la pantalla para explorar
                </p>
              </div>

              {/* Animated touch indicator */}
              <div className="relative flex items-center justify-center mt-2" style={{ width: 120, height: 120 }}>
                {/* Pulse rings – CSS only */}
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="absolute rounded-full border border-cyan-400/30"
                    style={{
                      width: 48,
                      height: 48,
                      top: '50%',
                      left: '50%',
                      animation: `ss-pulse-ring 2.2s ${i * 0.6}s ease-out infinite`,
                      willChange: 'transform, opacity',
                    }}
                  />
                ))}

                {/* Center touch dot */}
                <div
                  className="relative w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(100,230,255,0.2) 0%, rgba(43,129,144,0.08) 100%)',
                    border: '1.5px solid rgba(100,230,255,0.4)',
                    animation: 'ss-dot-pulse 2s ease-in-out infinite',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(150,235,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
                    <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom vignette */}
            <div
              className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(3,14,26,0.5) 0%, transparent 100%)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
