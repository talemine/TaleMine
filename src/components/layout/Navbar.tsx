import Logo from "../ui/Logo";
import Button from "../ui/Button";
import Container from "../ui/Container";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Readers", href: "#readers" },
  { name: "Writers", href: "#writers" },
  { name: "Vision", href: "#vision" },
  { name: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-lg">
      <Container>
        <div className="flex h-20 items-center justify-between">

          <Logo />

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

          <Button href="#waitlist">
            Join Waitlist
          </Button>

        </div>
      </Container>
    </header>
  );
}