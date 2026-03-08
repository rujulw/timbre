const Footer = () => {
  const reportBugUrl = 'https://github.com/rujulw/timbre/issues';

  return (
    <footer className="h-14 border-t border-white/5 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-450 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold tracking-wide text-white/45">timbre.audio</p>
          <a
            href={reportBugUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
          >
            report bug
          </a>
        </div>
        <p className="text-[10px] font-semibold tracking-wide text-right text-white/35">v1.0.0 release</p>
      </div>
    </footer>
  );
};

export default Footer;
