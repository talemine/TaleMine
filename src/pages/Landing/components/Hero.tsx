import { useEffect, useRef, useState } from "react";
import Container from "../../../components/ui/Container";
import Section from "../../../components/ui/Section";
import Button from "../../../components/ui/Button";
import { motion } from "framer-motion";
import heroVideo from "../../../assets/hero/talemine-hero.mp4";
import heroPoster from "../../../assets/hero.png";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  /*
   * Defer loading the (1.1MB) hero video until it's about to scroll into
   * view, instead of downloading it unconditionally on first paint. This
   * keeps the initial page load fast — the poster image renders instantly
   * in its place until then.
   */
  useEffect(() => {
    const node = videoContainerRef.current;

    if (!node || shouldLoadVideo) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoadVideo]);

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
            {t.hero.badge}
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
            {t.hero.title}
            <br />
            {t.hero.titleLine2}
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
            {t.hero.description}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="mt-8 md:mt-10 flex justify-center gap-6 flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <Button href="#waitlist">
            {t.nav.joinWaitlist}
          </Button>

          <Button variant="outline" href="#vision">
            {t.hero.exploreVision}
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
            ref={videoContainerRef}
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
            {shouldLoadVideo ? (
              <video
                className="w-full h-full object-cover"
                src={heroVideo}
                poster={heroPoster}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
            ) : (
              <img
                src={heroPoster}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm animate-bounce">
            {t.hero.scrollToExplore}
          </p>
        </div>
      </Container>
    </Section>
  );
}