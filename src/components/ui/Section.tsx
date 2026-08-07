import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  id?: string;
}

export default function Section({
  children,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className="py-24 md:py-32"
    >
      {children}
    </section>
  );
}