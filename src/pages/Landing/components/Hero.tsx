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
          className="mt-20 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl">⛏️</div>

              <p className="mt-4 text-cyan-300 font-semibold">
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