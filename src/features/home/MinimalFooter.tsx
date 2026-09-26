import { footerLinks } from "./Footer";

/** Compact single-row footer for dark app pages. */
export default function MinimalFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-6 text-sm text-white/50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <nav className="flex gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.title}
            </a>
          ))}
        </nav>
        <span>© {new Date().getFullYear()} logm8</span>
      </div>
    </footer>
  );
}
