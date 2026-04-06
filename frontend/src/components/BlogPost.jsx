import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import blogData from "../constants/blog.json";
import { StarsCanvas } from "./canvas";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const BlogPost = () => {
  const { id } = useParams();
  const post = blogData.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    // Add copy button to pre tags
    const preTags = document.querySelectorAll('.prose pre');

    preTags.forEach((pre) => {
      // Apply syntax highlighting
      const codeBlock = pre.querySelector('code');
      if (codeBlock && !codeBlock.dataset.highlighted) {
        hljs.highlightElement(codeBlock);
        codeBlock.dataset.highlighted = 'true';
      }

      // Check if button already exists to avoid duplicates
      if (pre.querySelector('.copy-button')) return;

      const button = document.createElement('button');
      button.className = 'copy-button';
      button.innerText = 'Copy';

      button.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        const text = code ? code.innerText : pre.innerText;

        try {
          await navigator.clipboard.writeText(text);
          button.innerText = 'Copied!';
          button.classList.add('copied');

          setTimeout(() => {
            button.innerText = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy: ', err);
          button.innerText = 'Error';
        }
      });

      pre.appendChild(button);
    });
  }, [post]);

  if (!post) {
    return (
      <div className='w-full h-screen flex flex-col items-center justify-center bg-primary'>
        <h2 className='text-white text-[32px] font-bold'>Post Not Found</h2>
        <Link to='/blog' className='mt-5 text-[#915eff] underline'>
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className='relative z-0 bg-primary pt-20 min-h-screen'>
      <div className={`${styles.paddingX} max-w-5xl mx-auto flex flex-col gap-10`}>
        {/* Back Button */}
        <Link to='/blog' className='flex items-center gap-2 text-secondary hover:text-white transition-colors'>
          <span>←</span> Back to all posts
        </Link>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10'
        >
          <img src={post.image} alt={post.title} className='w-full h-full object-cover' />
        </motion.div>

        {/* Header Section */}
        <motion.div variants={textVariant()}>
          <div className='flex items-center gap-3 mb-4'>
            <span className='w-8 h-[2px] bg-[#915eff]' />
            <p className='text-[#915eff] font-bold text-[14px] uppercase tracking-[4px]'>
              {post.type || "Article"}
            </p>
          </div>

          <p className='text-secondary font-medium text-[16px] mb-2'>{post.date}</p>
          <h1 className='text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px] leading-tight'>
            {post.title}
          </h1>
          <div className='mt-4 flex flex-wrap gap-2'>
            {post.tags.map((tag) => (
              <span key={tag} className='px-3 py-1 bg-tertiary rounded-full text-[14px] text-secondary border border-white/5'>
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* AI Summary Highlight */}
        <motion.div
          variants={fadeIn("up", "tween", 0.1, 1)}
          className='bg-white/[0.03] backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative'
        >
          {/* Subtle accent glow */}
          <div className='absolute top-0 left-0 w-1 h-full bg-[#915eff]/50' />

          <p className='text-[#915eff] text-[14px] uppercase font-bold mb-2 tracking-widest opacity-80'>AI Generated Summary</p>
          <p className='text-white/90 italic text-[18px] leading-[32px]'>
            "{post.aiSummary}"
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={fadeIn("up", "tween", 0.2, 1)}
          className='prose prose-invert prose-lg max-w-none text-secondary text-[18px] leading-[32px] mt-4 mb-20'
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <div className='fixed inset-0 z-[-1]'>
        <StarsCanvas />
      </div>
    </div>
  );
};

export default SectionWrapper(BlogPost, "blog-post");
