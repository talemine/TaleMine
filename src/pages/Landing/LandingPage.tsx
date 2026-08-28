import Hero from "./components/Hero";
import About from "./components/About";
import ReaderFeatures from "./components/ReaderFeatures";
import WriterFeatures from "./components/WriterFeatures";
import Vision from "./components/Vision";
import Roadmap from "./components/Roadmap";
import Waitlist from "./components/Waitlist";

import PublicStoryList from "../../components/story/PublicStoryList";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <About />
      <ReaderFeatures />

      <PublicStoryList />

      <WriterFeatures />
      <Vision />
      <Roadmap />
      <Waitlist />
    </main>
  );
}