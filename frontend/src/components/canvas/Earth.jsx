import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";
import useMobile from "../../hooks/useMobile";
import useWebglSupport from "../../hooks/useWebglSupport";

const Earth = () => {
  const earth = useGLTF(`${import.meta.env.BASE_URL}planet/scene.gltf`);

  useEffect(() => {
    if (earth.error) {
      console.error("Error loading Earth model:", earth.error);
    }
  }, [earth.error]);

  if (!earth) return null;

  return (
    <primitive
      object={earth.scene}
      scale={2.5}
      position-y={0}
      rotation-y={0}
      onError={(error) => console.error("Error rendering Earth:", error)}
    />
  );
};

const EarthCanvas = () => {
  const isMobile = useMobile();
  const isWebglSupported = useWebglSupport();

  if (!isWebglSupported) {
    return (
      <div className="w-full h-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#151030] to-[#0b0f1a] flex items-center justify-center text-center px-6">
        <p className="text-secondary text-sm leading-6">
          3D globe unavailable in this browser.
        </p>
      </div>
    );
  }

  const wrapperClassName = isMobile
    ? 'w-full h-[280px] cursor-pointer'
    : 'w-full h-full cursor-pointer';

  const camera = isMobile
    ? { fov: 42, near: 0.1, far: 200, position: [-3.5, 2.4, 7] }
    : { fov: 45, near: 0.1, far: 200, position: [-4, 3, 6] };

  const dpr = isMobile ? [1, 1.5] : [1, 2];

  return (
    <div className={wrapperClassName}>
      <Canvas
        shadows
        frameloop='demand'
        dpr={dpr}
        gl={{ preserveDrawingBuffer: true }}
        camera={camera}
        className="w-full h-full cursor-pointer"
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            autoRotate
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 1, 1]} intensity={2} />
          <Earth />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default EarthCanvas;
