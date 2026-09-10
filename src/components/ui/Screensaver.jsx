import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   Optimized Click Ripple (Reemplaza WaterCanvas)
───────────────────────────────────────────── */
function ClickRipple({ clickPos }) {
  if (!clickPos) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[0, 1, 2].map(ring => (
        <motion.div
          key={`${clickPos.x}-${clickPos.y}-${ring}`}
          className="absolute rounded-full border border-[rgba(100,210,255,0.6)]"
          style={{
            left: clickPos.x,
            top: clickPos.y,
            x: '-50%',
            y: '-50%',
            borderWidth: 15 + ring * 10,
            boxShadow: '0 0 20px rgba(100,210,255,0.4)',
          }}
          initial={{ width: 0, height: 0, opacity: 1 - ring * 0.25 }}
          animate={{ 
            width: Math.max(window.innerWidth, window.innerHeight) * 2.5, 
            height: Math.max(window.innerWidth, window.innerHeight) * 2.5, 
            opacity: 0 
          }}
          transition={{ duration: 1.5, delay: ring * 0.08, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Floating Particles
───────────────────────────────────────────── */
function Particles({ count = 28 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 3.5,
      duration: 6 + Math.random() * 12,
      delay: Math.random() * 8,
      driftX: (Math.random() - 0.5) * 30,
      driftY: -(15 + Math.random() * 35),
      opacity: 0.2 + Math.random() * 0.5,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(100,210,255,${p.opacity}), rgba(43,129,144,${p.opacity * 0.4}))`,
            boxShadow: `0 0 ${p.size * 3}px rgba(100,210,255,${p.opacity * 0.6})`,
          }}
          animate={{
            x: [0, p.driftX * 0.5, p.driftX, p.driftX * 0.5, 0],
            y: [0, p.driftY * 0.3, p.driftY, p.driftY * 1.4, p.driftY * 1.8],
            opacity: [0, p.opacity, p.opacity * 0.8, p.opacity * 0.3, 0],
            scale: [0.5, 1.2, 1, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Ripple rings decoration
───────────────────────────────────────────── */
function RippleRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[1, 2, 3, 4, 5].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            borderColor: `rgba(43,129,144,${0.35 - i * 0.06})`,
            boxShadow: `0 0 30px rgba(43,180,255,${0.12 - i * 0.018})`,
          }}
          animate={{
            width: [80 + i * 90, 130 + i * 110, 80 + i * 90],
            height: [80 + i * 90, 130 + i * 110, 80 + i * 90],
            opacity: [0.6 - i * 0.08, 0.3 - i * 0.04, 0.6 - i * 0.08],
          }}
          transition={{
            duration: 4 + i * 0.8,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
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
  const [clickPos, setClickPos] = useState(null);
  const timerRef = useRef(null);
  const visibleRef = useRef(false);
  const isPreviewMode = new URLSearchParams(window.location.search).get('screensaver') === '1';
  const SCREENSAVER_DELAY = isPreviewMode ? 3000 : 3 * 60 * 1000; // 3s en preview, 3min en producción

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      visibleRef.current = true;
      setClickPos(null);
      setVisible(true);
    }, SCREENSAVER_DELAY);
  }, [SCREENSAVER_DELAY]);

  const handleActivity = useCallback(() => {
    // Solo reiniciar el timer si el screensaver NO está visible
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
    if (!visibleRef.current) return;
    visibleRef.current = false;
    
    // Si el evento tiene coordenadas de cliente, las usamos; si no, al centro.
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e.clientX !== undefined) {
      x = e.clientX;
      y = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }

    setClickPos({ x, y });

    // Pequeño delay para permitir que la onda se expanda antes de salir
    setTimeout(() => {
      setVisible(false);
      onWake?.();
      startTimer();
    }, 450);
  }, [onWake, startTimer]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="screensaver"
          className="fixed inset-0 z-[9999] overflow-hidden cursor-pointer select-none"
          style={{ background: 'radial-gradient(circle at center, #1a2a44 0%, #08111e 50%, #000000 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.15, 
            filter: 'blur(20px) brightness(1.8)', 
            transition: { duration: 1.2, ease: 'easeIn' } 
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          onPointerDown={handleTouch}
        >
          {/* Water background */}
          <ClickRipple clickPos={clickPos} />

          {/* Floating particles */}
          <Particles count={32} />

          {/* Decorative ripple rings */}
          <RippleRings />

          {/* Movimiento de ola de luz (reemplaza línea scan) */}
          <motion.div
            className="absolute left-0 right-0 pointer-events-none opacity-50 mix-blend-screen"
            style={{ height: '25vh', filter: 'blur(6px)' }}
            animate={{ top: ['-25%', '110%'] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
          >
            <motion.svg 
              viewBox="0 0 2880 320" 
              className="w-[200%] h-full" 
              preserveAspectRatio="none"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <path 
                fill="none" 
                stroke="url(#wave-stroke)" 
                strokeWidth="24"
                d="M0,160 C320,300, 400,20, 720,160 C1040,300, 1120,20, 1440,160 C1760,300, 1840,20, 2160,160 C2480,300, 2560,20, 2880,160"
              />
              <defs>
                <linearGradient id="wave-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(43,180,255,0)" />
                  <stop offset="50%" stopColor="rgba(100,230,255,0.7)" />
                  <stop offset="100%" stopColor="rgba(43,180,255,0)" />
                </linearGradient>
              </defs>
            </motion.svg>
          </motion.div>

          {/* Main content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">

            {/* CAUCE Logo */}
            <motion.div
              className="relative"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow halo behind logo */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  filter: 'blur(40px)',
                  background: 'radial-gradient(circle, rgba(43,129,144,0.7) 0%, rgba(0,80,160,0.3) 60%, transparent 100%)',
                  transform: 'scale(2.5)',
                }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [2.2, 2.8, 2.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.img
                src="/logo/logo cauce blanco completo.png"
                alt="CAUCE"
                className="relative z-10"
                style={{
                  width: 'clamp(180px, 22vw, 320px)',
                  filter: 'drop-shadow(0 0 24px rgba(43,200,255,0.55)) drop-shadow(0 0 60px rgba(43,129,144,0.3))',
                }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(43,200,255,0.5)) drop-shadow(0 0 50px rgba(43,129,144,0.25))',
                    'drop-shadow(0 0 36px rgba(100,230,255,0.75)) drop-shadow(0 0 80px rgba(43,180,200,0.4))',
                    'drop-shadow(0 0 20px rgba(43,200,255,0.5)) drop-shadow(0 0 50px rgba(43,129,144,0.25))',
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Thin horizontal divider */}
            <motion.div
              className="relative flex items-center gap-4"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-cyan-400/60" />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                style={{ boxShadow: '0 0 10px rgba(43,210,255,0.8)' }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-cyan-400/60" />
            </motion.div>

            {/* "INICIA AQUÍ" text */}
            <div className="relative text-center">
              {/* Large background glow text */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <span
                  className="font-black uppercase tracking-[0.3em] text-transparent select-none"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                    WebkitTextStroke: '1px rgba(43,200,255,0.15)',
                    filter: 'blur(18px)',
                    color: 'rgba(43,200,255,0.25)',
                  }}
                >
                  INICIA AQUÍ
                </span>
              </div>

              {/* Main text with shimmer */}
              <motion.h1
                className="relative font-black uppercase tracking-[0.25em] leading-none"
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 5rem)',
                  background: 'linear-gradient(135deg, #e0f7ff 0%, #7de8ff 30%, #2bb8d4 55%, #7de8ff 75%, #ffffff 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 20px rgba(43,200,255,0.5))',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                INICIA AQUÍ
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="mt-4 font-mono tracking-[0.4em] uppercase text-cyan-300/60 text-sm"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                Toca la pantalla para explorar
              </motion.p>
            </div>

            {/* Animated touch indicator */}
            <div className="relative flex items-center justify-center mt-2">
              {/* Outer pulse rings */}
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-cyan-400/40"
                  animate={{
                    width: [48, 90 + i * 24],
                    height: [48, 90 + i * 24],
                    opacity: [0.7, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Center touch dot */}
              <motion.div
                className="relative w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(100,230,255,0.25) 0%, rgba(43,129,144,0.1) 100%)',
                  border: '2px solid rgba(100,230,255,0.5)',
                  boxShadow: '0 0 20px rgba(43,200,255,0.35), inset 0 0 12px rgba(43,200,255,0.15)',
                }}
                animate={{
                  scale: [1, 1.12, 1],
                  boxShadow: [
                    '0 0 20px rgba(43,200,255,0.35), inset 0 0 12px rgba(43,200,255,0.15)',
                    '0 0 40px rgba(43,200,255,0.6), inset 0 0 20px rgba(43,200,255,0.3)',
                    '0 0 20px rgba(43,200,255,0.35), inset 0 0 12px rgba(43,200,255,0.15)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Hand touch icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(150,235,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
                  <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
                  <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
                  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
              </motion.div>
            </div>

            {/* Bottom wave decoration */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(3,14,26,0.6) 0%, transparent 100%)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
