import { useEffect, useState } from "react";
import { HiOutlineArrowUp } from "react-icons/hi2";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 500);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        border
        border-cyan-400/30
        bg-slate-950/80
        text-cyan-400
        shadow-lg
        backdrop-blur-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400
        hover:bg-cyan-400
        hover:text-slate-950
      "
    >
      <HiOutlineArrowUp className="text-xl" />
    </button>
  );
}