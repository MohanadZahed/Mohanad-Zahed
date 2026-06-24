import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, useProgress } from '@react-three/drei';
import { Scene } from './scene/Scene';
import { useScrollStore } from './store/useScrollStore';
import { useLenis } from './hooks/useLenis';
import { useScrollTrigger } from './hooks/useScrollTrigger';
import { useSectionHash } from './hooks/useSectionHash';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Manifesto } from './sections/manifesto/Manifesto';
import { Skills } from './sections/Skills';
import { Knowledge } from './sections/knowledge/Knowledge';
import { KnowledgeBackground } from './sections/knowledge/KnowledgeBackground';
import { Certificates } from './sections/certificates/Certificates';
import { Experience } from './sections/experience/Experience';
import { Contact } from './sections/Contact';
import { ScrollLogger } from './debug/ScrollLogger';
import { LanguageSwitcher } from './components/LanguageSwitcher';
// import { FontSwitcher } from './components/FontSwitcher'; // hidden from UI; kept for future use
import { ViewportIndicator } from './components/ViewportIndicator';
import { useT } from './i18n/useT';

// Holds the hero intro until the WebGL scene has finished loading AND compiling
// (Preload forces shader compilation during the load phase). Only then does the
// shared intro clock start, so the GPU init hitch lands during a brief black
// hold instead of freezing the name-reveal tween mid-fold. Renders nothing.
function HeroIntroGate() {
  const { active, loaded, total } = useProgress();
  const firedRef = useRef(false);

  const fire = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    // Two rAFs: let Preload's compile + first paint settle before the clock starts.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        useScrollStore.getState().setHeroStartedAt(performance.now());
      }),
    );
  };

  useEffect(() => {
    if (total > 0 && loaded >= total && !active) fire();
  }, [active, loaded, total]);

  // Safety net: never let the intro hang if loading stalls or assets are absent.
  useEffect(() => {
    const id = window.setTimeout(fire, 4000);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}

function App() {
  useLenis();
  useScrollTrigger();
  useSectionHash();
  const { t, locale } = useT();

  useEffect(() => {
    document.title = t('meta.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.description'));
  }, [t, locale]);

  return (
    <>
      <div className='fixed top-4 right-4 z-50 flex items-center gap-3 pointer-events-none'>
        {/* <FontSwitcher /> — hidden from the UI; component kept for future use */}
        <LanguageSwitcher />
      </div>
      <KnowledgeBackground />
      <div className='fixed inset-0 -z-10 pointer-events-none'>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Scene />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
      <HeroIntroGate />

      <main>
        <Hero />
        <About />
        <Manifesto />
        <Skills />
        <Knowledge />
        <Certificates />
        <Experience />
        <Contact />
      </main>

      {import.meta.env.DEV && <ScrollLogger />}
      <ViewportIndicator />
    </>
  );
}

export default App;
