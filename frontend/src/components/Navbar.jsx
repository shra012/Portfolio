import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { styles } from "../styles";
import { navLinks as baseNavLinks } from "../constants";
import { logo, menu, close } from "../assets";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleNavigation = (nav) => {
    setActive(nav.title);
    
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
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`${styles.paddingX
        } w-full flex items-center py-5 fixed top-0 z-20 ${scrolled ? "bg-primary" : "bg-transparent"
        }`}
    >
      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        <Link
          to='/'
          className='flex items-center gap-2'
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <img src={logo} alt='logo' className='w-9 h-9 object-contain' />
          <p className='text-white text-[18px] font-bold cursor-pointer flex '>
            Shravan &nbsp;
            <span className='sm:block hidden'> | Portfolio</span>
          </p>
        </Link>

        <ul className='list-none hidden sm:flex flex-row gap-10'>
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className={`
                ${active === nav.title ? "text-white" : "text-secondary"} 
                hover:text-white 
                text-[18px] font-medium cursor-pointer transition-colors duration-300
              `}
              onClick={() => handleNavigation(nav)}
            >
              {nav.title}
            </li>
          ))}
        </ul>

        <div className='sm:hidden flex flex-1 justify-end items-center'>
          <img
            src={toggle ? close : menu}
            alt='menu'
            className='w-[28px] h-[28px] object-contain'
            onClick={() => setToggle(!toggle)}
          />

          <div
            className={`${!toggle ? "hidden" : "flex"
              } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
          >
            <ul className='list-none flex justify-end items-start flex-1 flex-col gap-4'>
              {navLinks.map((nav) => (
                <li
                  key={nav.id}
                  className={`font-poppins font-medium cursor-pointer text-[16px] ${
                    active === nav.title ? "text-white" : "text-secondary"
                  } transition-colors duration-300`}
                  onClick={() => {
                    setToggle(!toggle);
                    handleNavigation(nav);
                  }}
                >
                  {nav.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
