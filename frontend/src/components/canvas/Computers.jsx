import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import CanvasLoader from '../Loader';
import useMobile from '../../hooks/useMobile';

const Computers = () => {
  const computer = useGLTF(`${import.meta.env.BASE_URL}desktop_pc/scene.gltf`);

  return (
    <mesh>
      <hemisphereLight intensity={0.15} groundColor='black' />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={0.75}
        position={[0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const isMobile = useMobile();

  const wrapperClassName = isMobile
    ? 'relative w-full h-[280px] cursor-pointer'
    : 'absolute inset-0 z-0 w-full h-full cursor-pointer';

  const camera = isMobile
    ? { position: [16, 3, 7], fov: 30 }
    : { position: [20, 3, 5], fov: 25 };

  const dpr = isMobile ? [1, 1.5] : [1, 2];

  return (
    <div className={wrapperClassName}>
      <Canvas
        frameloop='demand'
        shadows
        dpr={dpr}
        camera={camera}
        gl={{ preserveDrawingBuffer: true }}
        className="w-full h-full cursor-pointer"
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Computers />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ComputersCanvas;
