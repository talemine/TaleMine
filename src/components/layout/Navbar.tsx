export default function Navbar() {
  return (
    <header className="fixed top-0 w-full backdrop-blur-md bg-slate-950/70 border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Tale<span className="text-cyan-400">Mine</span>
        </h1>

        <nav className="hidden md:flex gap-8">
          <a href="#about">About</a>
          <a href="#readers">Readers</a>
          <a href="#writers">Writers</a>
          <a href="#vision">Vision</a>
          <a href="#roadmap">Roadmap</a>
        </nav>

        <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2 rounded-full font-semibold transition">
          Join Waitlist
        </button>

      </div>
    </header>
  );
}