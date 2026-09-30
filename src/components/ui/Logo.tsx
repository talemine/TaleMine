import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      aria-label="TaleMine home"
      className="text-3xl font-extrabold"
    >
      <span className="text-white">
        Tale
      </span>

      <span className="text-cyan-400">
        Mine
      </span>
    </Link>
  );
}