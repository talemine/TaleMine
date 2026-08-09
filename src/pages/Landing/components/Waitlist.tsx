import { useState } from "react";
import Section from "../../../components/ui/Section";
import Container from "../../../components/ui/Container";
import Button from "../../../components/ui/Button";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
  }

  return (
    <Section id="waitlist">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Join the Waitlist
          </h2>

          <p className="mt-6 text-lg text-gray-300 leading-8">
            Be among the first to discover TaleMine and help shape the future
            of storytelling.
          </p>

          {/* Form */}
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mt-10 flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                required
                pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                title="Please enter a valid email address, such as you@example.com"
                className="flex-1 rounded-xl bg-slate-900/60 border border-cyan-500/20 px-5 py-4 text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />

              <Button type="submit">
                Join Waitlist
              </Button>
            </form>
          ) : (
            <div className="mt-10 rounded-2xl bg-slate-900/60 border border-cyan-500/20 p-8 max-w-xl mx-auto">
              <p className="text-xl font-semibold text-white">
                You're on the list! 🎉
              </p>

              <p className="mt-3 text-gray-300">
                We'll let you know when TaleMine is ready.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}