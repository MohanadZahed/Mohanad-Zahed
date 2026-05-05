import { useEffect, useRef } from "react";
import gsap from "gsap";

const NAME = "Mohanad Zahed";
const TITLE = "Frontend Architect";
const TAGLINE =
  "+8 Jahre Leidenschaft für saubere Architektur, modernen Code und Workflows";

function MaskedChars({ text }: { text: string }) {
  return (
    <span aria-hidden="true" className="inline-block whitespace-nowrap">
      {[...text].map((char, i) =>
        char === " " ? (
          <span key={i} className="inline-block w-[0.4em]" />
        ) : (
          <span key={i} className="inline-block" data-char>
            {char}
          </span>
        ),
      )}
    </span>
  );
}

export function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const nameEl = nameRef.current;
    const titleEl = titleRef.current;
    const taglineEl = taglineRef.current;
    if (!nameEl || !titleEl || !taglineEl) return;

    const titleChars = titleEl.querySelectorAll("[data-char]");

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(nameEl, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      gsap.set([...titleChars], { yPercent: 0 });
      gsap.set(taglineEl, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(nameEl, {
      clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
    });
    gsap.set(titleChars, { yPercent: 110 });
    gsap.set(taglineEl, { opacity: 0, y: 16 });

    const tl = gsap.timeline();

    tl.to(
      nameEl,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.1,
        ease: "power4.out",
        onComplete: () => gsap.set(nameEl, { clipPath: "none" }),
      },
      0,
    );

    tl.to(
      titleChars,
      {
        yPercent: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "power3.out",
      },
      0.3,
    );

    tl.to(
      taglineEl,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      0.9,
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      aria-labelledby="hero-h1"
      className="relative min-h-screen flex flex-col items-center justify-start pt-[12vh] overflow-x-hidden"
    >
      {/* Upper block — cream fill, navy text, rotated +3deg */}
      <div
        ref={titleRef}
        aria-label={TITLE}
        className="text-tertiary inline-flex items-center justify-center overflow-hidden font-bold uppercase"
        style={{
          transform: "rotate(0deg)",
          outlineOffset: 0,
          padding: "0 1.2vw 0.6vw",
          fontSize: "clamp(1.5rem, 6vw, 8rem)",
          lineHeight: 1,
          letterSpacing: "-0.15vw",
        }}
      >
        <MaskedChars text={TITLE} />
      </div>

      {/* Giant block — navy fill, cream text, amber outline, rotated -3deg */}
      <h1
        id="hero-h1"
        ref={nameRef}
        aria-label={NAME}
        className="bg-tertiary text-primary inline-flex items-center justify-center overflow-hidden font-bold uppercase m-0"
        style={{
          transform: "rotate(-3deg)",
          outline: "0.5vw solid var(--color-primary)",
          outlineOffset: 0,
          padding: "0 1.5vw 0.8vw",
          fontSize: "clamp(2.5rem, 9vw, 12rem)",
          lineHeight: 1,
          letterSpacing: "-0.2vw",
        }}
      >
        <MaskedChars text={NAME} />
      </h1>

      {/* Tagline */}
      <p
        ref={taglineRef}
        className="mt-[4vw] max-w-2xl text-center text-base sm:text-lg leading-relaxed px-4"
        style={{
          color: "color-mix(in srgb, var(--color-tertiary) 80%, transparent)",
        }}
      >
        {TAGLINE}
      </p>
    </section>
  );
}
