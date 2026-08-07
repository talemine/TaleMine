import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl text-center"
      >

        <p className="uppercase tracking-[0.3em] text-cyan-400 mb-5">
          Discover • Read • Belong
        </p>

        <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">

          Discover Stories

          <br />

          Worth Digging For.

        </h1>

        <p className="mt-8 text-xl text-slate-300 leading-9">

          TaleMine is a new storytelling platform where readers discover unforgettable stories and writers build lasting audiences—without algorithms burying great work.

        </p>

        <div className="mt-12 flex gap-6 justify-center flex-wrap">

          <button className="bg-cyan-500 px-8 py-4 rounded-full font-semibold text-slate-900 hover:scale-105 transition">

            Join the Waitlist

          </button>

          <button className="border border-slate-600 px-8 py-4 rounded-full hover:border-cyan-400 transition">

            Explore Our Vision

          </button>

        </div>

      </motion.div>

    </section>
  );
}