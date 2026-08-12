import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="
        rounded-2xl
        bg-slate-900/60
        border border-cyan-500/20
        p-8
        text-center
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-cyan-400
        hover:shadow-[0_0_25px_rgba(34,211,238,0.15)]
      "
    >
      <div className="text-6xl mb-6 flex justify-center">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-4 text-gray-300 leading-7">
        {description}
      </p>
    </motion.div>
  );
}