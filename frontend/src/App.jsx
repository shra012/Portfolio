import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

import {
  Navbar,
  Hero,
  About,
  Tech,
  Experience,
  Works,
  Contact,
  StarsCanvas,
  LoadingScreen,
  ScrollToTop,
  Blog,
  BlogPost
} from './components';
import Footer from "./components/Footer";
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import FeedbackForm from './components/FeedbackForm';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const toastShown = React.useRef(false);

  useEffect(() => {
    // Show browser compatibility toast only once
    if (!toastShown.current) {
      toast('For best experience, please use Firefox if you encounter any issues in Chrome', {
        duration: 3000,
        icon: '🌐',
      });
      toastShown.current = true;
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const AppContent = () => {
    const location = useLocation();
    const showLoading = isLoading && location.pathname === '/';

    return (
      <AnimatePresence mode="wait">
        {showLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex-grow"
          >
            <Navbar />
            <Routes>
              <Route path="/" element={
                <>
                  <div className='bg-hero-pattern bg-cover bg-no-repeat bg-center'>
                    <Hero />
                  </div>
                  <About />
                  <Experience />
                  <Tech />
                  <Works />
                  <div className='relative z-0'>
                    <Contact />
                    <StarsCanvas />
                  </div>
                </>
              } />
              <Route path="/blog" element={
                <Blog />
              } />
              <Route path="/blog/:id" element={
                <BlogPost />
              } />
              <Route path="/feedback" element={
                <>
                  <StarsCanvas />
                  <FeedbackForm />
                </>
              } />
            </Routes>
            <ScrollToTop />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <div className='relative z-0 bg-primary min-h-screen flex flex-col overflow-x-hidden'>
          <AppContent />
          <Footer />
        </div>
          <Toaster
            toastOptions={{
              style: {
                background: 'rgb(var(--c-tertiary))',
                color: 'rgb(var(--c-white))',
                border: '1px solid var(--surface-border)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
