import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  disabled,
}: ButtonProps) {
  const styles = {
    primary:
      "bg-cyan-500 text-black hover:bg-cyan-400",

    secondary:
      "bg-white text-black hover:bg-gray-200",

    outline:
      "border border-white text-white hover:bg-white hover:text-black",
  };

  const className = `
    inline-flex
    items-center
    justify-center
    px-8
    py-4
    rounded-full
    font-semibold
    transition-all
    duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    ${styles[variant]}
  `;

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}