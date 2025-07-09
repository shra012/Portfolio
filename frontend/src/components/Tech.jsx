import React, { useState, useEffect } from "react";

import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

import { styles } from "../styles";
import { motion } from "framer-motion";
import { textVariant } from "../utils/motion";

const Tech = () => {
  const [webglSupported, setWebglSupported] = useState(true);
  const [failedCanvases, setFailedCanvases] = useState(new Set());
  const [isChrome, setIsChrome] = useState(false);
  const [maxWebGLComponents, setMaxWebGLComponents] = useState(8);

  useEffect(() => {
    // Detect Chrome browser
    const detectChrome = () => {
      const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      setIsChrome(isChromeBrowser);
      
      // Set WebGL limits based on browser
      if (isChromeBrowser) {
        setMaxWebGLComponents(0); // No 3D components in Chrome - all 2D
      } else {
        setMaxWebGLComponents(technologies.length); // All WebGL in other browsers (Firefox, Safari, etc.)
      }
      
      return isChromeBrowser;
    };

    // Check WebGL support
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || 
                   canvas.getContext('webgl') || 
                   canvas.getContext('experimental-webgl');
        
        if (!gl) {
          setWebglSupported(false);
          return false;
        }

        // Test WebGL capabilities
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log('WebGL Renderer:', renderer);
          
          // Check for software rendering (poor performance)
          if (renderer.includes('SwiftShader') || renderer.includes('Software')) {
            setMaxWebGLComponents(0); // No 3D for software rendering
          }
        }

        return true;
      } catch (error) {
        console.error('WebGL support check failed:', error);
        setWebglSupported(false);
        return false;
      }
    };

    detectChrome();
    checkWebGLSupport();
  }, []);

  const handleCanvasError = (technologyName) => {
    console.warn(`WebGL failed for ${technologyName}, falling back to 2D`);
    setFailedCanvases(prev => new Set([...prev, technologyName]));
  };

  const TechIcon = ({ technology, index }) => {
    const shouldUseWebGL = webglSupported && 
                          !failedCanvases.has(technology.name) && 
                          index < maxWebGLComponents;

    if (shouldUseWebGL) {
      return (
        <div className='w-28 h-28' key={technology.name}>
          <BallCanvas 
            icon={technology.icon} 
            onError={() => handleCanvasError(technology.name)}
          />
        </div>
      );
    }

    // Fallback 2D component
    return (
      <div 
        className='w-28 h-28 flex items-center justify-center bg-gray-300 rounded-full hover:bg-[#915EFF] transition-colors duration-300 group'
        key={technology.name}
        title={technology.name}
      >
        <img 
          src={technology.icon} 
          alt={technology.name}
          className='w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300'
          onError={(e) => {
            // Fallback for broken images
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="text-white text-xs text-center font-medium">
                ${technology.name}
              </div>
            `;
          }}
        />
      </div>
    );
  };

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-center`}>
          My skills and tools
        </p>
        <h2 className={`${styles.sectionHeadText} text-center`}>
          Arsenal
        </h2>
      </motion.div>
      
      <div className='flex flex-row flex-wrap justify-center gap-10 mt-10'>
        {/* Show performance info for debugging */}
        {isChrome && (
          <div className="w-full text-center mb-4">
            <p className="text-xs text-gray-400">
              {!webglSupported && " (WebGL not supported)"}
            </p>
          </div>
        )}
        {technologies.map((technology, index) => (
          <TechIcon 
            key={technology.name} 
            technology={technology} 
            index={index}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Tech, "");
