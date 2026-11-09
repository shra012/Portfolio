import React, { useState } from "react";
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects, projectCategories } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  live_demo_link,
  live_demo_label,
}) => {
  return (
    <motion.div
      variants={fadeIn("up", "spring", (index % 3) * 0.15, 0.75)}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.15 }}
    >
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className='bg-tertiary p-5 rounded-2xl w-full sm:w-[360px] max-w-full h-full flex flex-col'
        style={{ minHeight: '540px' }}
      >
        <div className='relative w-full h-[200px] sm:h-[230px]'>
          <img
            src={image}
            alt='project_image'
            className='w-full h-full object-cover rounded-2xl'
          />

          <div
            onClick={() => window.open(source_code_link, "_blank")}
            className='absolute top-2 right-2 w-10 h-10 rounded-full bg-[#0b0f1a]/80 backdrop-blur-[2px] flex justify-center items-center cursor-pointer'
          >
            <img
              src={github}
              alt='source code'
              className='w-1/2 h-1/2 object-contain'
            />
          </div>
        </div>

        <div className='flex-1 flex flex-col'>
          <div className='mt-5'>
            <h3 className='text-white font-bold text-[24px]'>{name}</h3>
            <p className='mt-2 text-secondary text-[14px]'>{description}</p>
          </div>

          <div className='mt-4 flex flex-wrap gap-2 mb-4'>
            {tags.map((tag) => (
              <p
                key={`${name}-${tag.name}`}
                className={`text-[14px] ${tag.color}`}
              >
                #{tag.name}
              </p>
            ))}
          </div>

          {live_demo_link && (
            <button
              onClick={() => window.open(live_demo_link, "_blank")}
              className='mt-auto px-6 py-3 bg-tertiary rounded-lg text-white font-medium hover:bg-tertiary/80 transition-all w-full text-center block border border-white'
            >
              {live_demo_label || "View Live Demo"}
            </button>
          )}
        </div>
      </Tilt>
    </motion.div>
  );
};

const ProjectGrid = ({ items }) => (
  <div className='mt-10 flex flex-wrap gap-7 justify-center'>
    {items.map((project, index) => (
      <ProjectCard key={project.name} index={index} {...project} />
    ))}
  </div>
);

const Works = () => {
  const [active, setActive] = useState("All");
  const tabs = ["All", ...projectCategories];
  const groups = projectCategories
    .filter((category) => active === "All" || active === category)
    .map((category) => ({ category, items: projects.filter((p) => p.category === category) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} `}>My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </motion.div>

      <div className='w-full flex'>
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]'
        >
          Selected work across AI and machine learning, data engineering, and software engineering. Each
          project links to its code, and to a demo, video, or write-up where one exists.
        </motion.p>
      </div>

      <div className='mt-10 flex flex-wrap gap-3' role='tablist' aria-label='Project categories'>
        {tabs.map((tab) => {
          const count = tab === "All" ? projects.length : projects.filter((p) => p.category === tab).length;
          const selected = active === tab;
          return (
            <button
              key={tab}
              role='tab'
              aria-selected={selected}
              onClick={() => setActive(tab)}
              className={`px-4 py-2 rounded-full text-[14px] font-semibold border transition-colors ${
                selected
                  ? "bg-accent text-white border-accent"
                  : "bg-tertiary text-secondary border-white/10 hover:text-white hover:border-white/30"
              }`}
            >
              {tab} <span className='opacity-70'>({count})</span>
            </button>
          );
        })}
      </div>

      {groups.map(({ category, items }) => (
        <section key={category} className='mt-14'>
          <h3 className='text-white font-bold text-[24px] sm:text-[28px] flex items-center gap-3'>
            <span className='w-8 h-[2px] bg-accent' />
            {category}
          </h3>
          <ProjectGrid items={items} />
        </section>
      ))}
    </>
  );
};

export default SectionWrapper(Works, "", "some");
