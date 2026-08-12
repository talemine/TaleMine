import { motion } from "framer-motion";
import { useState } from "react";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import Button from "../../../components/ui/Button";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
  }

  return (
    <Section id="waitlist">
      <Container>
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Join the Waitlist
          </h2>

          <p className="mt-5 md:mt-6 text-base md:text-lg text-gray-300 leading-7 md:leading-8">
            Be among the first to discover TaleMine and help shape the future
            of storytelling.
          </p>
        </motion.div>

        {/* Form / Success Message */}
        <motion.div
          className="
            mt-10
            max-w-3xl
            mx-auto
            rounded-2xl
            bg-slate-900/60
            border border-cyan-500/20
            p-6 md:p-8
          "
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                required
                pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                title="Please enter a valid email address, such as you@example.com"
                className="
                  flex-1
                  rounded-xl
                  bg-slate-950/70
                  border border-cyan-500/20
                  px-5 py-4
                  text-white
                  placeholder-gray-500
                  outline-none
                  transition-all
                  focus:border-cyan-400
                  focus:ring-1
                  focus:ring-cyan-400
                "
              />

              <Button type="submit">
                Join Waitlist
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-xl md:text-2xl font-semibold text-white">
                You're on the list! 🎉
              </p>

              <p className="mt-3 text-gray-300">
                We'll let you know when TaleMine is ready.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Closing Statement */}
        <motion.p
          className="mt-10 text-sm md:text-base text-cyan-300 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Great stories are waiting to be discovered.
        </motion.p>
      </Container>
    </Section>
  );
}