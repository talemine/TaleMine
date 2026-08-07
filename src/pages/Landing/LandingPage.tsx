import Navbar from "../../components/layout/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import ReaderFeatures from "./components/ReaderFeatures";
import WriterFeatures from "./components/WriterFeatures";
import Vision from "./components/Vision";
import Roadmap from "./components/Roadmap";
import Waitlist from "./components/Waitlist";
import Footer from "../../components/layout/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <ReaderFeatures />
        <WriterFeatures />
        <Vision />
        <Roadmap />
        <Waitlist />
      </main>

      <Footer />
    </>
  );
}