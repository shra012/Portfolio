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
      I’m <strong>Shravankumar Nagarajan</strong>, a software engineer experienced in building intelligent, scalable systems across fintech, publishing, and consulting domains. I specialize in the <strong>Java ecosystem</strong>, <strong>Python</strong>, and <strong>cloud-native architectures</strong>, and have led initiatives in <strong>performance engineering</strong>, <strong>infrastructure automation</strong>, and <strong>search platform development</strong> — including building <strong>syntactic and semantic search</strong> for <a href="https://www.scopus.com" target="_blank" rel="noopener noreferrer">Scopus</a> and <a href="https://www.mendeley.com" target="_blank" rel="noopener noreferrer">Mendeley</a>. My interests lie in <strong>information retrieval</strong>, <strong>machine learning</strong>, and designing systems that transform complexity into clarity. I find deep satisfaction in <strong>designing modular systems</strong>, <strong>refactoring legacy codebases</strong>, and <strong>architecting solutions that endure complexity with clarity and purpose</strong>.
      <br /><br />
      As I pivot toward advanced data intelligence, now pursuing my MS in Applied Data Intelligence at San José State University, I’m focused on applying and researching models like XGBoost, Random Forests, and big data algorithms such as DGIM, LSH, and Vector Databases. My work emphasizes not just building scalable analytical pipelines, but also measuring performance through metrics like precision, recall, and F1-scores to ensure robust and interpretable outcomes. I’m particularly interested in Retrieval-Augmented Generation (RAG) and agentic AI, exploring how Large Language Models can evolve from passive predictors to autonomous, reasoning systems that transform data into actionable intelligence.
      </motion.p>

      <motion.a
        href={`${import.meta.env.BASE_URL}Shravankumar_Nagarajan_Resume.pdf`}
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
