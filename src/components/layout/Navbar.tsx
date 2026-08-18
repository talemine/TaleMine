import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";

import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../../services/supabase";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Readers", href: "#readers" },
  { name: "Writers", href: "#writers" },
  { name: "Vision", href: "#vision" },
  { name: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { session } = useAuth();
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    closeMenu();
    navigate("/login");
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

          {/* Desktop Authentication Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                <Button href="/account">
                  Account
                </Button>

                <Button variant="outline" onClick={handleLogout}>
                  Log Out
                </Button>
              </>
            ) : (
              <Button href="#waitlist">
                Join Waitlist
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
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

              {session ? (
                <>
                  <div className="mt-3" onClick={closeMenu}>
                    <Button href="/account">
                      Account
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Button variant="outline" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-3" onClick={closeMenu}>
                  <Button href="#waitlist">
                    Join Waitlist
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}