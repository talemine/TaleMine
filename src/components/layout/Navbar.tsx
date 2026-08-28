import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineBell,
} from "react-icons/hi2";

import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../../services/supabase";
import { useLanguage } from "../../i18n/LanguageContext";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Readers", href: "#readers" },
  { name: "Writers", href: "#writers" },
  { name: "Vision", href: "#vision" },
  { name: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { session } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  function closeMenu() {
    setMenuOpen(false);
  }

  async function loadUnreadCount() {
    if (!session?.user.id) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", session.user.id)
      .is("read_at", null);

    if (error) {
      console.error(
        "Unread notification count error:",
        error
      );
      return;
    }

    setUnreadCount(count ?? 0);
  }

  useEffect(() => {
    loadUnreadCount();
  }, [session?.user.id]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    const userId = session.user.id;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setUnreadCount(
            (currentCount) => currentCount + 1
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );
      return;
    }

    setUnreadCount(0);
    closeMenu();
    navigate("/login");
  }

  function openNotifications() {
    closeMenu();
    navigate("/account");
  }

  function openLibrary() {
    closeMenu();
    navigate("/library");
  }

  function openStories() {
    closeMenu();
    navigate("/stories");
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
                {link.name === "About" && t.nav.about}
                {link.name === "Readers" && t.nav.readers}
                {link.name === "Writers" && t.nav.writers}
                {link.name === "Vision" && t.nav.vision}
                {link.name === "Roadmap" && t.nav.roadmap}
              </a>
            ))}
          </nav>

          {/* Desktop Authentication Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center rounded-full border border-slate-700 bg-slate-900/60 p-1">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  language === "en"
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  language === "hi"
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>
            {session ? (
              <>
                {/* Stories */}
                <Button
                  variant="outline"
                  onClick={openStories}
                >
                  {t.nav.stories}
                </Button>

                {/* Library */}
                <Button
                  variant="outline"
                  onClick={openLibrary}
                >
                  {t.nav.library}
                </Button>

                {/* Notifications */}
                <button
                  type="button"
                  onClick={openNotifications}
                  aria-label={
                    unreadCount > 0
                      ? `${unreadCount} unread notifications`
                      : "Notifications"
                  }
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-400"
                >
                  <HiOutlineBell className="text-xl" />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-xs font-bold text-slate-950">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </button>

                <Button href="/account">
                  {t.nav.account}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  {t.nav.logout}
                </Button>
              </>
            ) : (
              <>
                {/* Public Stories */}
                <Button
                  variant="outline"
                  onClick={openStories}
                >
                  {t.nav.stories}
                </Button>

                {/* Log In */}
                <Button
                  variant="outline"
                  href="/login"
                >
                  {t.nav.login}

                </Button>

                {/* Join Waitlist */}
                <Button href="#waitlist">
                  {t.nav.joinWaitlist}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
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
              <div className="mb-2 flex items-center justify-end px-4">
                <div className="flex items-center rounded-full border border-slate-700 bg-slate-900/60 p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "en"
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    EN
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage("hi")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "hi"
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
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
                  {/* Mobile Stories */}
                  <button
                    type="button"
                    onClick={openStories}
                    className="mt-3 w-full rounded-xl px-4 py-3 text-left text-slate-200 transition hover:bg-slate-900 hover:text-cyan-400"
                  >
                    {t.nav.stories}
                  </button>

                  {/* Mobile Library */}
                  <button
                    type="button"
                    onClick={openLibrary}
                    className="w-full rounded-xl px-4 py-3 text-left text-slate-200 transition hover:bg-slate-900 hover:text-cyan-400"
                  >
                    {t.nav.library}
                  </button>

                  {/* Mobile Notifications */}
                  <button
                    type="button"
                    onClick={openNotifications}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-slate-200 transition hover:bg-slate-900 hover:text-cyan-400"
                  >
                    <span className="flex items-center gap-3">
                      <HiOutlineBell className="text-xl" />
                      {t.nav.notifications}
                    </span>

                    {unreadCount > 0 && (
                      <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-xs font-bold text-slate-950">
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                  </button>

                  <div
                    className="mt-2"
                    onClick={closeMenu}
                  >
                    <Button href="/account">
                      {t.nav.account}
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                    >
                      {t.nav.logout}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Stories */}
                  <button
                    type="button"
                    onClick={openStories}
                    className="mt-3 w-full rounded-xl px-4 py-3 text-left text-slate-200 transition hover:bg-slate-900 hover:text-cyan-400"
                  >
                    {t.nav.stories}
                  </button>

                  {/* Mobile Log In */}
                  <div
                    className="mt-2"
                    onClick={closeMenu}
                  >
                    <Button
                      variant="outline"
                      href="/login"
                    >
                      {t.nav.login}
                    </Button>
                  </div>

                  {/* Mobile Join Waitlist */}
                  <div
                    className="mt-2"
                    onClick={closeMenu}
                  >
                    <Button href="#waitlist">
                      {t.nav.joinWaitlist}
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}