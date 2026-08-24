import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import blogData from "../constants/blogData";

const BlogCard = ({ index, id, title, date, aiSummary, image, tags }) => (
  <motion.div
    variants={fadeIn("up", "spring", index * 0.5, 0.75)}
    className='bg-primary p-5 rounded-2xl sm:w-[360px] w-full shadow-card hover:shadow-2xl transition-all duration-300 border border-white/10'
  >
    <Link to={`/blog/${id}`}>
      <div className='relative w-full h-[230px] overflow-hidden rounded-xl'>
        <img
          src={image}
          alt='project_image'
          className='w-full h-full object-cover rounded-2xl transform hover:scale-110 transition-transform duration-500'
        />

        <div className='absolute inset-0 flex justify-end m-3 card-img_hover'>
          <div className='black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer'>
            <span className='text-white text-[12px] font-bold'>Read</span>
          </div>
        </div>
      </div>

      <div className='mt-5'>
        <h3 className='text-white font-bold text-[24px] leading-tight hover:text-accent transition-colors'>
          {title}
        </h3>
        <p className='text-secondary text-[12px] mt-2 mb-3'>{date}</p>
        
        {/* AI Summary Section */}
        <div className='bg-white/[0.03] backdrop-blur-sm p-5 rounded-2xl border border-white/10 mb-4 relative overflow-hidden shadow-2xl'>
          <div className='absolute top-0 left-0 w-1 h-full bg-accent/50' />
          <p className='text-accent text-[10px] uppercase font-bold mb-1 tracking-wider opacity-80'>AI Summary</p>
          <p className='text-white/80 text-[14px] italic leading-relaxed'>
            "{aiSummary}"
          </p>
        </div>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <p
            key={`${id}-${tag}`}
            className={`text-[14px] blue-text-gradient`}
          >
            #{tag}
          </p>
        ))}
      </div>
    </Link>
  </motion.div>
);

const Blog = () => {
  return (
    <div className='mt-12'>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>Technical Deep Dives & Reflections</p>
        <h2 className={`${styles.sectionHeadText}`}>The AI Ledger.</h2>
      </motion.div>

      <div className='w-full flex'>
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]'
        >
          Sharing my thoughts, experiences, and technical deep dives into 
          <strong> AI</strong>, <strong>Performance Engineering</strong>, and 
          <strong> Modular System Design</strong>. Each post contains a quick AI generated summary for efficient reading.
        </motion.p>
      </div>

      <div className='mt-20 flex flex-wrap gap-7'>
        {blogData.map((post, index) => (
          <BlogCard key={`blog-${index}`} index={index} {...post} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Blog, "blog");
