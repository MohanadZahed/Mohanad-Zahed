import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './scene/Scene';
import { useLenis } from './hooks/useLenis';
import { useScrollTrigger } from './hooks/useScrollTrigger';
import { Hero } from './sections/Hero';
import { HeroBackground } from './sections/HeroBackground';
import { About } from './sections/About';
import { Notebook } from './sections/notebook/Notebook';
import { Skills } from './sections/Skills';
import { Knowledge } from './sections/knowledge/Knowledge';
import { KnowledgeBackground } from './sections/knowledge/KnowledgeBackground';
import { Certificates } from './sections/certificates/Certificates';
import { Experience } from './sections/experience/Experience';
import { Contact } from './sections/Contact';
import { ScrollLogger } from './debug/ScrollLogger';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useT } from './i18n/useT';

function App() {
  useLenis();
  useScrollTrigger();
  const { t, locale } = useT();

  useEffect(() => {
    document.title = t('meta.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.description'));
  }, [t, locale]);

  return (
    <>
      <LanguageSwitcher />
      <HeroBackground />
      <KnowledgeBackground />
      <div className='fixed inset-0 -z-10 pointer-events-none'>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <main>
        <Hero />
        <About />
        <Notebook />
        <Skills />
        <Knowledge />
        <Certificates />
        <Experience />
        <Contact />
      </main>

      {import.meta.env.DEV && <ScrollLogger />}
    </>
  );
}

export default App;
