import Container from "../../../components/ui/Container";
import Section from "../../../components/ui/Section";
import Button from "../../../components/ui/Button";
import { motion } from "framer-motion";
import heroVideo from "../../../assets/hero/talemine-hero.mp4";

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
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Discover Stories
            <br />
            Worth Digging For.
          </h1>
        </motion.div>

        {/* Description */}
        <motion.div
          className="mt-6 md:mt-8 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="text-lg text-gray-300 leading-8">
            TaleMine is a new storytelling platform where readers discover
            unforgettable stories and writers build lasting audiences—without
            algorithms burying great work.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="mt-8 md:mt-10 flex justify-center gap-6 flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <Button>Join Waitlist</Button>

          <Button variant="outline">
            Explore Our Vision
          </Button>
        </motion.div>

        {/* Hero Video */}
        <motion.div
          className="mt-12 md:mt-16 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div
            className="
              relative
              w-full
              max-w-2xl
              aspect-video
              overflow-hidden
              rounded-3xl
              [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]
              [-webkit-mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]
            "
          >
            <video
              className="w-full h-full object-cover"
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
            />
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