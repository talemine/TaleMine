import type {
  ReactNode,
} from "react";

interface ButtonProps {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "outline";
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  disabled,
  onClick,
  className = "",
}: ButtonProps) {
  const styles = {
    primary:
      "bg-cyan-500 text-black hover:bg-cyan-400",

    secondary:
      "bg-white text-black hover:bg-gray-200",

    outline:
      "border border-white text-white hover:bg-white hover:text-black",
  };

  const buttonClassName = `
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
    ${className}
  `;

  if (href) {
    return (
      <a
        href={href}
        className={buttonClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}