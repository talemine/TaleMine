import Container from "../../../components/ui/Container";
import Section from "../../../components/ui/Section";
import Button from "../../../components/ui/Button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <Section>
      <Container>

        {/* Badge */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="uppercase tracking-[8px] text-cyan-400 text-sm font-semibold">
            Discover • Read • Belong
          </p>
        </motion.div>

        {/* Heading */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Discover Stories
            <br />
            Worth Digging For.
          </h1>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mt-8 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="text-lg text-gray-300 leading-8">
            TaleMine is a new storytelling platform where readers discover unforgettable stories and writers build lasting audiences—without algorithms burying great work.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="mt-10 flex justify-center gap-6 flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <Button>Join Waitlist</Button>

          <Button variant="outline">
            Explore Our Vision
          </Button>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div
          className="mt-16 md:mt-20 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-cyan-500/20 via-slate-900 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center overflow-hidden">

            {/* Outer Glow */}
            <div className="absolute inset-4 rounded-full border border-cyan-400/10" />
            <div className="absolute inset-10 rounded-full border border-cyan-400/10" />

            {/* Floating Story Particles */}
            <div className="absolute top-16 left-20 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <div className="absolute top-28 right-16 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
            <div className="absolute bottom-20 left-16 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <div className="absolute bottom-16 right-20 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

            {/* Story Core */}
            <div className="relative z-10 text-center">

              <div className="mx-auto w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-950/80 border border-cyan-400/30 shadow-[0_0_35px_rgba(34,211,238,0.15)] flex items-center justify-center">

                <svg
                  viewBox="0 0 64 64"
                  className="w-14 h-14 md:w-16 md:h-16 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 14h16c5 0 8 3 11 6v32c-3-3-6-6-11-6H10V14Z" />
                  <path d="M54 14H38c-5 0-8 3-11 6v32c3-3 6-6 11-6h16V14Z" />
                  <path d="M32 20v32" />
                </svg>

              </div>

              <p className="mt-5 text-sm md:text-base text-cyan-300 font-semibold">
                Unearthing Great Stories
              </p>

            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm animate-bounce">
            ↓ Scroll to Explore
          </p>
        </div>

      </Container>
    </Section>
  );
}