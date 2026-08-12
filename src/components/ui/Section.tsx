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
      className="min-h-screen flex items-center py-20 md:py-24"
    >
      {children}
    </section>
  );
}