import { useState } from "react";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Readers", href: "#readers" },
  { name: "Writers", href: "#writers" },
  { name: "Vision", href: "#vision" },
  { name: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-lg">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-slate-300 transition hover:text-cyan-400"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button href="#waitlist">
              Join Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-400 md:hidden"
          >
            {menuOpen ? (
              <HiOutlineXMark className="text-2xl" />
            ) : (
              <HiOutlineBars3 className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-slate-800/50 py-5 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-slate-200 transition hover:bg-slate-900 hover:text-cyan-400"
                >
                  {link.name}
                </a>
              ))}

              <div className="mt-3">
                <Button href="#waitlist">
                  Join Waitlist
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}