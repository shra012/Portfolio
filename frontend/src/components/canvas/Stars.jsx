import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import CanvasLoader from '../Loader';
import useMobile from "../../hooks/useMobile";
import useWebglSupport from "../../hooks/useWebglSupport";
import { useTheme } from "../../contexts/ThemeContext";

// Night: dense far-off starfield. Day: sparse motes drifting through the sky.
const FIELDS = {
  dark: { count: 5000, radius: 1.2, color: '#f272c8', size: 0.002, spinX: 10, spinY: 15, opacity: 1 },
  light: { count: 1200, radius: 1.4, color: '#d79a43', size: 0.0035, spinX: 30, spinY: 42, opacity: 0.34 },
};

const DaySky = () => (
  <div className='day-sky' aria-hidden='true'>
    <div className='day-sun' />
    <div className='day-cloud day-cloud--one' />
    <div className='day-cloud day-cloud--two' />
    <div className='day-cloud day-cloud--three' />
  </div>
);

const Field = ({ isDark, ...props }) => {
  const ref = useRef();
  const cfg = isDark ? FIELDS.dark : FIELDS.light;

  const positions = useMemo(
    () => random.inSphere(new Float32Array(cfg.count), { radius: cfg.radius }),
    [cfg.count, cfg.radius]
  );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / cfg.spinX;
      ref.current.rotation.y -= delta / cfg.spinY;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color={cfg.color}
          size={cfg.size}
          opacity={cfg.opacity}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = () => {
  const isMobile = useMobile();
  const isWebglSupported = useWebglSupport();
  const { isDark } = useTheme();

  return (
    <div className='absolute inset-0 z-[-1] overflow-hidden pointer-events-none'>
      {!isDark && <DaySky />}

      {!isMobile && isWebglSupported && (
        <Canvas
          className='atmosphere-canvas'
          key={isDark ? 'dark' : 'light'}
          camera={{ position: [0, 0, 1] }}
          aria-hidden='true'
        >
          <Suspense fallback={<CanvasLoader />}>
            <Field isDark={isDark} />
          </Suspense>
          <Preload all />
        </Canvas>
      )}
    </div>
  );
};

export default StarsCanvas;
