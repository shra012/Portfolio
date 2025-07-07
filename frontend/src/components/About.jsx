import React from "react";
import { motion } from "framer-motion";
import { HiDownload } from "react-icons/hi";
import { Tilt } from "react-tilt";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ServiceCard = ({ index, title, icon, link }) => (
  <div className='xs:w-[250px] w-full'>
    <Tilt
      options={{
        max: 45,
        scale: 1,
        speed: 450,
      }}
      className='w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card cursor-pointer'
    >
      <div
        className='bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col'
        onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={icon}
          alt='web-development'
          className='w-16 h-16 object-contain'
        />

        <h3 className='text-white text-[20px] font-bold text-center'>
          {title}
        </h3>
      </div>
    </Tilt>
  </div>
);

const About = () => {
  return (
    <motion.div variants={textVariant()}>
      <p className={styles.sectionSubText}>Introduction</p>
      <h2 className={styles.sectionHeadText}>Overview.</h2>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
      >
      I’m Shravankumar Nagarajan, a seasoned software engineer driven by a passion for building intelligent, scalable systems that solve real-world problems. With over a decade of experience across fintech, publishing, and consulting, I’ve honed my craft in the Java ecosystem, Python, and cloud-native architectures. My career has been shaped by leading initiatives in performance engineering, infrastructure automation, and search platform development each project grounded in clean code principles and strategic thinking. I find deep satisfaction in designing modular systems, refactoring legacy codebases, and architecting solutions that endure complexity with grace.
      <br /><br />
      Now, as I pivot toward advanced data analytics, I bring with me not only a strong foundation in systems engineering but also an insatiable curiosity for insight generation. Having been accepted into the MS in Data Analytics program at San Jose State University, I’m focused on exploring the intersection of engineering, machine learning, and decision science. My goal is to bridge the gap between raw data and actionable intelligence building systems that not only work but think. I’m drawn to problems where scale meets nuance, and where every line of code contributes to a larger story of impact.
      </motion.p>

      <motion.a
        href="/Shravankumar_Nagarajan_Resume.pdf"
        download
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors mt-6"
      >
        <HiDownload className="w-5 h-5" />
        Download Resume
      </motion.a>

      <div className="mt-20 flex flex-wrap gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </motion.div>
  );
};

export default SectionWrapper(About, "about");
