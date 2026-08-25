import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";
import blogData from "../constants/blogData";
import { StarsCanvas } from "./canvas";
import { useTheme } from "../contexts/ThemeContext";
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const BlogPost = () => {
  const { id } = useParams();
  const post = blogData.find((p) => p.id === id);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const { isDark } = useTheme();
  const [isDarkReader, setIsDarkReader] = useState(isDark);
  const useDarkCodeTheme = isReaderMode ? isDarkReader : isDark;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isReaderMode) {
      document.body.style.overflow = 'hidden';
      setIsDarkReader(isDark);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [id, isReaderMode, isDark]);

  useEffect(() => {
    // Add copy button to pre tags
    const preTags = document.querySelectorAll('.prose pre');

    preTags.forEach((pre) => {
      // Apply syntax highlighting
      const codeBlock = pre.querySelector('code');
      if (codeBlock) {
        const languageClass = Array.from(codeBlock.classList)
          .find((className) => className.startsWith('language-'));

        pre.dataset.language = languageClass
          ? languageClass.replace('language-', '')
          : 'code';

        if (!codeBlock.dataset.highlighted) {
          hljs.highlightElement(codeBlock);
          codeBlock.dataset.highlighted = 'true';
        }
      }

      // Check if button already exists to avoid duplicates
      if (pre.querySelector('.copy-button')) return;

      const button = document.createElement('button');
      button.className = 'copy-button';
      button.innerText = 'Copy';
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy code to clipboard');

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
  }, [post, isReaderMode, isDarkReader]);

  if (!post) {
    return (
      <div className='w-full h-screen flex flex-col items-center justify-center bg-primary'>
        <h2 className='text-white text-[32px] font-bold'>Post Not Found</h2>
        <Link to='/blog' className='mt-5 text-accent underline'>
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer()}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.25 }}
      className={`relative z-0 min-h-screen transition-colors duration-500 ${isReaderMode ? 'reader-mode' : ''} ${isReaderMode ? (isDarkReader ? 'fixed inset-0 z-[9999] bg-[#111111] overflow-y-scroll text-gray-300 pt-10 pb-20 font-serif w-full reader-mode-dark' : 'fixed inset-0 z-[9999] bg-[#FFFBF0] overflow-y-scroll text-gray-900 pt-10 pb-20 font-serif w-full reader-mode-light') : 'bg-primary pt-20'}`}
      style={isReaderMode ? { scrollbarWidth: 'thin', scrollbarColor: isDarkReader ? '#4B5563 transparent' : '#D1D5DB transparent' } : {}}>
      <div className={`mx-auto flex flex-col gap-10 ${isReaderMode ? 'max-w-3xl px-6 sm:px-12 gap-8 w-full' : `${styles.paddingX} max-w-5xl`}`}>
        
        {/* Top Controls */}
        <div className="flex justify-between items-center z-10 relative">
          {isReaderMode ? (
            <button 
              onClick={() => setIsReaderMode(false)}
              className={`flex items-center gap-2 transition-colors font-sans font-semibold ${isDarkReader ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <span>←</span> Exit Reader Mode
            </button>
          ) : (
            <Link to='/blog' className='flex items-center gap-2 transition-colors font-sans text-secondary hover:text-white'>
              <span>←</span> Back to all posts
            </Link>
          )}
          
          <div className="flex items-center gap-3">
            {isReaderMode && (
              <button 
                onClick={() => setIsDarkReader(!isDarkReader)}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center font-sans shadow-md ${isDarkReader ? 'bg-gray-800 text-yellow-400 border border-gray-700 hover:bg-gray-700' : 'bg-[#Ece6d4] text-gray-800 border border-[#D5cea3] hover:bg-[#Dbd5aa]'}`}
                title={isDarkReader ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkReader ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>
            )}

            {!isReaderMode && (
              <button 
                onClick={() => setIsReaderMode(true)}
                className='px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 font-sans shadow-lg bg-tertiary text-white border border-white/10 hover:border-white/30'
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                Reader Mode
              </button>
            )}
          </div>
        </div>

        {/* Hero Image */}
        {!isReaderMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10'
          >
            <img src={post.image} alt={post.title} className='w-full h-full object-cover' />
          </motion.div>
        )}

        {/* Header Section */}
        <div>
          {!isReaderMode && (
            <div className='flex items-center gap-3 mb-4'>
              <span className='w-8 h-[2px] bg-accent' />
              <p className='text-accent font-bold text-[14px] uppercase tracking-[4px]'>
                {post.type || "Article"}
              </p>
            </div>
          )}

          <p className={`font-medium text-[16px] mb-2 font-sans ${isReaderMode ? (isDarkReader ? 'text-gray-400 mt-8' : 'text-gray-500 mt-8') : 'text-secondary'}`}>{post.date}</p>
          <h1 className={`font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px] leading-tight ${isReaderMode ? (isDarkReader ? 'text-[#EAEAEA] font-serif' : 'text-[#2a2a2a] font-serif') : 'text-white'}`}>
            {post.title}
          </h1>
          
          {!isReaderMode && (
            <div className='mt-4 flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
                <span key={tag} className='px-3 py-1 bg-tertiary rounded-full text-[14px] text-secondary border border-white/5'>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Summary Highlight */}
        {!isReaderMode && (
          <div className='bg-white/[0.03] backdrop-blur-sm p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative'>
            <div className='absolute top-0 left-0 w-1 h-full bg-accent/50' />
            <p className='text-accent text-[14px] uppercase font-bold mb-2 tracking-widest opacity-80'>AI Generated Summary</p>
            <p className='text-white/90 italic text-[18px] leading-[32px]'>
              "{post.aiSummary}"
            </p>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`prose prose-lg blog-article ${useDarkCodeTheme ? 'code-theme-dark' : 'code-theme-light'} max-w-none mb-20 transition-all duration-500 ${isReaderMode ? (isDarkReader ? 'prose-invert text-[#D1D5DB]' : 'prose-slate text-[#333333]') : 'text-secondary text-[18px] leading-[32px] mt-4'}`}
          style={isReaderMode ? { fontSize: '21px', lineHeight: '1.85' } : {}}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {!isReaderMode && (
        <div className='fixed inset-0 z-[-1]'>
          <StarsCanvas />
        </div>
      )}
    </motion.div>
  );
};

export default BlogPost;
