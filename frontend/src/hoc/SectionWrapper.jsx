import { motion } from "framer-motion";

import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

// viewportAmount: share of the section that must be visible before it animates in. Tall sections
// (long project grids, blog posts) can never show 25% of themselves at once, so they pass "some".
const StarWrapper = (Component, idName, viewportAmount = 0.25) =>
  function HOC() {
    return (
      <motion.section
        variants={staggerContainer()}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: viewportAmount }}
        className={`${styles.padding} max-w-7xl mx-auto relative z-0`}
      >
        <span className='hash-span' id={idName}>
          &nbsp;
        </span>

        <Component />
      </motion.section>
    );
  };

export default StarWrapper;
