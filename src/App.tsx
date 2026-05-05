import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './scene/Scene'
import { useLenis } from './hooks/useLenis'
import { useScrollTrigger } from './hooks/useScrollTrigger'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Projects } from './sections/Projects'
import { Experience } from './sections/Experience'
import { Contact } from './sections/Contact'
import { ScrollLogger } from './debug/ScrollLogger'

function App() {
  useLenis()
  useScrollTrigger()

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none bg-canvas-gradient">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>

      {import.meta.env.DEV && <ScrollLogger />}
    </>
  )
}

export default App
