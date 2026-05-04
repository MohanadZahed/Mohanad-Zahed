export function Hero() {
  return (
    <section
      aria-labelledby="hero-h1"
      className="relative min-h-screen flex items-start"
    >
      <div className="px-8 pt-24 sm:px-16 sm:pt-32 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400 mb-4">
          Hamburg · Frontend Architect
        </p>
        <h1
          id="hero-h1"
          className="text-5xl sm:text-6xl font-semibold leading-tight text-zinc-100"
        >
          Mohanad Zahed
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-zinc-300">
          Software Architect Frontend / Senior Frontend Engineer
        </p>
        <p className="mt-8 text-base sm:text-lg text-zinc-400 leading-relaxed">
          8+ years building Angular applications for insurance, telecom, retail,
          and the German public sector. Clean architecture, micro-frontends, and
          headless migrations from legacy SAP Commerce.
        </p>
      </div>
    </section>
  )
}
