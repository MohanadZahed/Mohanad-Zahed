export function Contact() {
  return (
    <section aria-labelledby='contact-h2' className='relative min-h-screen flex items-center'>
      <div className='px-8 sm:px-16 max-w-xl'>
        <h2 id='contact-h2' className='text-3xl sm:text-4xl font-semibold text-zinc-100'>
          Contact
        </h2>
        <p className='mt-4 text-zinc-400'>
          <a
            href='mailto:mzahed-p@outlook.com'
            className='text-[var(--color-accent-sky)] underline-offset-4 hover:underline'
          >
            mzahed-p@outlook.com
          </a>
        </p>
      </div>
    </section>
  );
}
