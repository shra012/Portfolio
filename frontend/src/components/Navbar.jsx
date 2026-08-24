import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import { HiBars3, HiMoon, HiSun, HiXMark } from "react-icons/hi2";

import { styles } from "../styles";
import { navLinks as baseNavLinks } from "../constants";
import { logo } from "../assets";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleNavigation = (nav) => {
    setActive(nav.title);
    setToggle(false);
    
    if (nav.url) {
      // External route navigation
      navigate(nav.url);
      window.scrollTo(0, 0);
    } else {
      // Internal section navigation
      if (location.pathname !== "/") {
        // If not on home page, navigate to home first then scroll to section
        navigate("/");
        // Use a longer timeout to ensure page loads before scrolling
        setTimeout(() => {
          const element = document.getElementById(nav.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        // Already on home page, just scroll to section
        setTimeout(() => {
          const element = document.getElementById(nav.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  let navLinks = [...baseNavLinks];

  if (location.pathname === "/feedback") {
    navLinks = [
      { id: "home", title: "Home", url: "/" },
    ];
  } else {
    navLinks = [
      ...baseNavLinks,
      { id: "feedback", title: "Feedback", url: "/feedback" }
    ];
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setToggle(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!toggle) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setToggle(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [toggle]);

  // Handle hash navigation on page load
  useEffect(() => {
    if (location.pathname === "/") {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.replace('#', '');
        // Increased timeout to ensure all components are loaded
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Update active state based on hash
            const navLink = baseNavLinks.find(link => link.id === elementId);
            if (navLink) {
              setActive(navLink.title);
            }
          }
        }, 500);
      }
    }
  }, [location.pathname]);

  return (
    <nav
      className={`${styles.paddingX} fixed inset-x-0 top-0 z-[1000] isolate w-full flex items-center py-4 sm:py-5 pointer-events-auto transition-[background-color,box-shadow,border-color] duration-300 border-b ${
        scrolled || toggle
          ? "bg-primary/90 backdrop-blur-xl border-[color:var(--surface-border)] shadow-[0_12px_36px_rgba(10,12,30,0.12)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className='relative z-20 w-full flex justify-between items-center max-w-7xl mx-auto'>
        <Link
          to='/'
          className='flex min-w-0 shrink items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          onClick={() => {
            setActive("");
            setToggle(false);
            window.scrollTo(0, 0);
          }}
        >
          <img
            src={logo}
            alt='logo'
            className={`w-9 h-9 object-cover rounded-lg transition-[object-position] duration-300 ${isDark ? 'object-left' : 'object-right'}`}
          />
          <p className='truncate text-white text-[17px] sm:text-[18px] font-bold cursor-pointer flex'>
            Shravan &nbsp;
            <span className='sm:block hidden'> | Portfolio</span>
          </p>
        </Link>

        {/* Desktop Navigation */}
        <ul className='list-none hidden lg:flex flex-row gap-6 xl:gap-10 items-center'>
          {navLinks.map((nav) => (
            <li key={nav.id}>
              <button
                type='button'
                className={`${active === nav.title ? "text-white" : "text-secondary"} hover:text-white text-[16px] xl:text-[18px] font-medium cursor-pointer transition-colors duration-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                onClick={() => handleNavigation(nav)}
              >
                {nav.title}
              </button>
            </li>
          ))}
          
          <li>
            <button
              type='button'
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className='text-secondary hover:text-white bg-tertiary/50 transition-colors duration-300 p-2 rounded-full border border-[color:var(--surface-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            >
              {isDark ? <HiSun className='w-5 h-5' /> : <HiMoon className='w-5 h-5' />}
            </button>
          </li>

          <li>
            <a
              href={`${import.meta.env.BASE_URL}Shravankumar_Nagarajan_Resume.pdf`}
              download
              className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/80 transition-colors flex items-center gap-2 text-[16px] shadow-lg"
            >
              <HiDownload className="w-4 h-4" />
              Resume
            </a>
          </li>
        </ul>

        {/* Mobile Navigation */}
        <div className='lg:hidden flex shrink-0 justify-end items-center gap-2 sm:gap-3'>
          <button
            type='button'
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className='text-secondary hover:text-white bg-tertiary/60 transition-colors duration-300 p-2 rounded-full border border-[color:var(--surface-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          >
            {isDark ? <HiSun className='w-5 h-5' /> : <HiMoon className='w-5 h-5' />}
          </button>

          <a
            href={`${import.meta.env.BASE_URL}Shravankumar_Nagarajan_Resume.pdf`}
            download
            className="bg-white text-black p-2 xs:px-3 xs:py-1.5 rounded-full font-medium text-[14px] flex items-center gap-1 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Download Resume"
          >
            <HiDownload className="w-4 h-4" />
            <span className='hidden xs:inline'>Resume</span>
          </a>

          <button
            type='button'
            aria-label={toggle ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={toggle}
            aria-controls='mobile-navigation'
            className='text-white grid h-10 w-10 place-items-center rounded-full bg-tertiary/60 border border-[color:var(--surface-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            onClick={() => setToggle((isOpen) => !isOpen)}
          >
            {toggle ? <HiXMark className='h-7 w-7' /> : <HiBars3 className='h-7 w-7' />}
          </button>
        </div>
      </div>

      {toggle && (
        <div className='lg:hidden'>
          <button
            type='button'
            aria-label='Close navigation menu'
            className='fixed inset-x-0 bottom-0 top-[68px] sm:top-[76px] z-0 cursor-default bg-slate-950/25 backdrop-blur-[2px]'
            onClick={() => setToggle(false)}
          />

          <div
            id='mobile-navigation'
            className='absolute top-full left-4 right-4 z-30 mt-3 overflow-hidden rounded-2xl border border-[color:var(--surface-border)] bg-tertiary/95 p-3 shadow-[0_24px_70px_rgba(6,8,22,0.28)] backdrop-blur-2xl'
          >
            <ul className='list-none flex flex-col gap-1'>
              {navLinks.map((nav) => (
                <li key={nav.id}>
                  <button
                    type='button'
                    className={`w-full rounded-xl px-4 py-3 text-left font-poppins font-medium text-[16px] ${
                      active === nav.title
                        ? "bg-accent/10 text-accent"
                        : "text-secondary hover:bg-primary/70 hover:text-white"
                    } transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
                    onClick={() => handleNavigation(nav)}
                  >
                    {nav.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
