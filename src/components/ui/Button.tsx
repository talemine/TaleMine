import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  children,
  variant = "primary",
}: ButtonProps) {

  const styles = {
    primary:
      "bg-cyan-500 text-black hover:bg-cyan-400",

    secondary:
      "bg-white text-black hover:bg-gray-200",

    outline:
      "border border-white text-white hover:bg-white hover:text-black",
  };

  return (
    <button
      className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}