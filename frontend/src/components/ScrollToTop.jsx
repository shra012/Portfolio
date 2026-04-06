import React, { useEffect, useState } from "react";
import { HiArrowUp } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top scroll behavior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-12 h-12 bg-[#915EFF] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#804dee] transition-colors focus:outline-none focus:ring-2 focus:ring-[#915EFF] focus:ring-offset-2 focus:ring-offset-primary"
          >
            <HiArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollToTop;
