import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";
import useMobile from "../../hooks/useMobile";
import useWebglSupport from "../../hooks/useWebglSupport";
import { useTheme } from "../../contexts/ThemeContext";

// The imported sphere's UV position for southern Tamil Nadu (roughly 9.2°N,
// 77.8°E), transformed through the model's baked scene matrices.
const TAMIL_NADU_NORMAL = new THREE.Vector3(0.9084, 0.1503, 0.3903).normalize();
const TAMIL_NADU_FACING_ROTATION = -1.753;
const LIGHT_EARTH_COLOR = new THREE.Color("#ffffff");
const DARK_EARTH_COLOR = new THREE.Color("#82a9ca");
const LIGHT_BAND_COLOR = new THREE.Color("#d9e8fa");
const DARK_BAND_COLOR = new THREE.Color("#a9bcdf");
const LIGHT_EMISSIVE = new THREE.Color("#000000");
const DARK_EARTH_EMISSIVE = new THREE.Color("#061326");
const DARK_BAND_EMISSIVE = new THREE.Color("#101831");
const LIGHT_KEY_COLOR = new THREE.Color("#ffd6a0");
const DARK_KEY_COLOR = new THREE.Color("#ffffff");
const LIGHT_KEY_POSITION = new THREE.Vector3(-3, 4, 5);
const DARK_KEY_POSITION = new THREE.Vector3(2, 1, 1);
const LIGHT_MARKER_CORE = new THREE.Color("#269fe6");
const DARK_MARKER_CORE = new THREE.Color("#6fcdf3");
const LIGHT_MARKER_MIDDLE = new THREE.Color("#dff4ff");
const DARK_MARKER_MIDDLE = new THREE.Color("#bceaff");
const LIGHT_MARKER_HALO = new THREE.Color("#72c9f5");
const DARK_MARKER_HALO = new THREE.Color("#319fd4");
const LIGHT_MARKER_MIDDLE_OPACITY = 0.78;
const DARK_MARKER_MIDDLE_OPACITY = 0.6;
const LIGHT_MARKER_HALO_OPACITY = 0.55;
const DARK_MARKER_HALO_OPACITY = 0.3;

const easeFactor = (delta) => 1 - Math.exp(-delta * 8);
const colorDistanceSquared = (first, second) => {
  const red = first.r - second.r;
  const green = first.g - second.g;
  const blue = first.b - second.b;
  return red * red + green * green + blue * blue;
};

const TamilNaduMarker = ({ isDark }) => {
  const coreMaterial = useRef();
  const middleMaterial = useRef();
  const haloMaterial = useRef();
  const invalidate = useThree((state) => state.invalidate);
  const initialIsDark = useRef(isDark).current;
  const markerQuaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      TAMIL_NADU_NORMAL
    ),
    []
  );

  useEffect(() => {
    invalidate();
  }, [invalidate, isDark]);

  useFrame((state, delta) => {
    if (!coreMaterial.current || !middleMaterial.current || !haloMaterial.current) {
      return;
    }

    const alpha = easeFactor(delta);
    const coreTarget = isDark ? DARK_MARKER_CORE : LIGHT_MARKER_CORE;
    const middleTarget = isDark ? DARK_MARKER_MIDDLE : LIGHT_MARKER_MIDDLE;
    const haloTarget = isDark ? DARK_MARKER_HALO : LIGHT_MARKER_HALO;

    coreMaterial.current.color.lerp(coreTarget, alpha);
    middleMaterial.current.color.lerp(middleTarget, alpha);
    haloMaterial.current.color.lerp(haloTarget, alpha);
    const middleOpacityTarget = isDark
      ? DARK_MARKER_MIDDLE_OPACITY
      : LIGHT_MARKER_MIDDLE_OPACITY;
    const haloOpacityTarget = isDark
      ? DARK_MARKER_HALO_OPACITY
      : LIGHT_MARKER_HALO_OPACITY;
    middleMaterial.current.opacity = THREE.MathUtils.damp(
      middleMaterial.current.opacity,
      middleOpacityTarget,
      8,
      delta
    );
    haloMaterial.current.opacity = THREE.MathUtils.damp(
      haloMaterial.current.opacity,
      haloOpacityTarget,
      8,
      delta
    );

    const transitioning =
      colorDistanceSquared(coreMaterial.current.color, coreTarget) > 0.00001
      || colorDistanceSquared(middleMaterial.current.color, middleTarget) > 0.00001
      || colorDistanceSquared(haloMaterial.current.color, haloTarget) > 0.00001
      || Math.abs(middleMaterial.current.opacity - middleOpacityTarget) > 0.002
      || Math.abs(haloMaterial.current.opacity - haloOpacityTarget) > 0.002;

    if (transitioning) state.invalidate();
  });

  const markerPosition = useMemo(
    () => TAMIL_NADU_NORMAL.clone().multiplyScalar(0.675),
    []
  );

  return (
    <group position={markerPosition} quaternion={markerQuaternion}>
      <mesh position-z={0.006} renderOrder={4}>
        <circleGeometry args={[0.0135, 32]} />
        <meshBasicMaterial
          ref={coreMaterial}
          color={initialIsDark ? DARK_MARKER_CORE : LIGHT_MARKER_CORE}
          toneMapped={false}
          depthTest
        />
      </mesh>
      <mesh position-z={0.004} renderOrder={3}>
        <ringGeometry args={[0.018, 0.023, 40]} />
        <meshBasicMaterial
          ref={middleMaterial}
          color={initialIsDark ? DARK_MARKER_MIDDLE : LIGHT_MARKER_MIDDLE}
          transparent
          opacity={initialIsDark
            ? DARK_MARKER_MIDDLE_OPACITY
            : LIGHT_MARKER_MIDDLE_OPACITY}
          toneMapped={false}
          depthTest
        />
      </mesh>
      <mesh position-z={0.002} renderOrder={2}>
        <ringGeometry args={[0.027, 0.034, 40]} />
        <meshBasicMaterial
          ref={haloMaterial}
          color={initialIsDark ? DARK_MARKER_HALO : LIGHT_MARKER_HALO}
          transparent
          opacity={initialIsDark
            ? DARK_MARKER_HALO_OPACITY
            : LIGHT_MARKER_HALO_OPACITY}
          toneMapped={false}
          depthTest
        />
      </mesh>
    </group>
  );
};

const Earth = ({ scale, isDark }) => {
  const invalidate = useThree((state) => state.invalidate);
  const initialIsDark = useRef(isDark).current;
  const earth = useGLTF(`${import.meta.env.BASE_URL}planet/scene.gltf`);
  const daytimeTexture = useLoader(
    THREE.TextureLoader,
    `${import.meta.env.BASE_URL}planet/textures/Planet_dayMap.jpg`
  );
  const nighttimeTexture = useLoader(
    THREE.TextureLoader,
    `${import.meta.env.BASE_URL}planet/textures/Planet_nightMap.jpg`
  );

  useEffect(() => {
    daytimeTexture.encoding = THREE.sRGBEncoding;
    daytimeTexture.anisotropy = 4;
    nighttimeTexture.encoding = THREE.sRGBEncoding;
    nighttimeTexture.anisotropy = 4;
  }, [daytimeTexture, nighttimeTexture]);

  const scene = useMemo(() => {
    const clonedScene = earth.scene.clone(true);
    clonedScene.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material = node.material.clone();
      }
    });
    return clonedScene;
  }, [earth.scene]);

  useEffect(() => {
    if (earth.error) {
      console.error("Error loading Earth model:", earth.error);
    }
  }, [earth.error]);

  useEffect(() => {
    const meshes = [];
    scene.traverse((node) => {
      if (node.isMesh && node.material) meshes.push(node);
    });

    meshes.forEach((node) => {
      if (!node.userData.originalMaterial) {
        node.userData.originalMaterial = node.material;
      }

      if (node.userData.portfolioMaterial) {
        node.material = node.userData.portfolioMaterial;
        return;
      }

      const original = node.userData.originalMaterial;
      const isPlanet = original.name === "Planet";
      const isCloudBand = original.name === "Clouds";

      node.userData.portfolioMaterial = isPlanet
        ? new THREE.MeshStandardMaterial({
            name: "Planet-portfolio",
            map: daytimeTexture,
            color: initialIsDark ? "#82a9ca" : "#ffffff",
            roughness: 0.92,
            metalness: 0.02,
            emissive: initialIsDark ? "#061326" : "#000000",
            emissiveIntensity: initialIsDark ? 0.42 : 0,
          })
        : new THREE.MeshStandardMaterial({
            name: "Cloud-bands-portfolio",
            map: original.map,
            color: isCloudBand
              ? (initialIsDark ? "#a9bcdf" : "#d9e8fa")
              : "#ffffff",
            roughness: 0.76,
            metalness: 0,
            emissive: initialIsDark ? "#101831" : "#000000",
            emissiveIntensity: initialIsDark ? 0.3 : 0,
            transparent: true,
            alphaTest: 0.08,
            depthWrite: false,
          });

      node.material = node.userData.portfolioMaterial;

      if (isPlanet && !node.userData.nightOverlay) {
        const nightMaterial = new THREE.MeshBasicMaterial({
          name: "Planet-night-lights",
          map: nighttimeTexture,
          transparent: true,
          opacity: initialIsDark ? 1 : 0,
          depthWrite: false,
          toneMapped: false,
        });
        const nightOverlay = new THREE.Mesh(node.geometry, nightMaterial);
        nightOverlay.name = "Planet-night-overlay";
        nightOverlay.scale.setScalar(1.0015);
        nightOverlay.renderOrder = 1;
        node.add(nightOverlay);
        node.userData.nightOverlay = nightOverlay;
      }
    });

    return () => {
      scene.traverse((node) => {
        if (node.userData.nightOverlay) {
          node.remove(node.userData.nightOverlay);
          node.userData.nightOverlay.material.dispose();
          node.userData.nightOverlay = null;
        }
        if (node.userData.portfolioMaterial) {
          node.userData.portfolioMaterial.dispose();
          node.userData.portfolioMaterial = null;
        }
      });
    };
  }, [daytimeTexture, initialIsDark, nighttimeTexture, scene]);

  useEffect(() => {
    invalidate();
  }, [invalidate, isDark]);

  useFrame((state, delta) => {
    const alpha = easeFactor(delta);
    let transitioning = false;

    scene.traverse((node) => {
      if (!node.isMesh || !node.userData.portfolioMaterial) return;

      const material = node.userData.portfolioMaterial;
      const isPlanet = material.name === "Planet-portfolio";
      const colorTarget = isPlanet
        ? (isDark ? DARK_EARTH_COLOR : LIGHT_EARTH_COLOR)
        : (isDark ? DARK_BAND_COLOR : LIGHT_BAND_COLOR);
      const emissiveTarget = isDark
        ? (isPlanet ? DARK_EARTH_EMISSIVE : DARK_BAND_EMISSIVE)
        : LIGHT_EMISSIVE;
      const intensityTarget = isDark ? (isPlanet ? 0.42 : 0.3) : 0;

      material.color.lerp(colorTarget, alpha);
      material.emissive.lerp(emissiveTarget, alpha);
      material.emissiveIntensity = THREE.MathUtils.damp(
        material.emissiveIntensity,
        intensityTarget,
        8,
        delta
      );

      if (isPlanet && node.userData.nightOverlay) {
        const nightOpacityTarget = isDark ? 1 : 0;
        const nightMaterial = node.userData.nightOverlay.material;
        nightMaterial.opacity = THREE.MathUtils.damp(
          nightMaterial.opacity,
          nightOpacityTarget,
          8,
          delta
        );
        transitioning = transitioning
          || Math.abs(nightMaterial.opacity - nightOpacityTarget) > 0.002;
      }

      transitioning = transitioning
        || colorDistanceSquared(material.color, colorTarget) > 0.00001
        || colorDistanceSquared(material.emissive, emissiveTarget) > 0.00001
        || Math.abs(material.emissiveIntensity - intensityTarget) > 0.002;
    });

    if (transitioning) state.invalidate();
  });

  if (!earth) return null;

  return (
    <group scale={scale} rotation-y={TAMIL_NADU_FACING_ROTATION}>
      <primitive
        object={scene}
        position-y={0}
        onError={(error) => console.error("Error rendering Earth:", error)}
      />
      <TamilNaduMarker isDark={isDark} />
    </group>
  );
};

const ThemeLights = ({ isDark }) => {
  const ambient = useRef();
  const hemisphere = useRef();
  const keyLight = useRef();
  const fillLight = useRef();
  const invalidate = useThree((state) => state.invalidate);
  const initialIsDark = useRef(isDark).current;
  const initialLighting = useMemo(() => ({
    ambient: initialIsDark ? 0.5 : 0.72,
    hemisphere: initialIsDark ? 0 : 1.2,
    keyIntensity: initialIsDark ? 2 : 2.15,
    keyPosition: initialIsDark ? DARK_KEY_POSITION : LIGHT_KEY_POSITION,
    keyColor: initialIsDark ? DARK_KEY_COLOR : LIGHT_KEY_COLOR,
    fill: initialIsDark ? 0 : 0.55,
  }), [initialIsDark]);

  useEffect(() => {
    invalidate();
  }, [invalidate, isDark]);

  useFrame((state, delta) => {
    if (!ambient.current || !hemisphere.current || !keyLight.current || !fillLight.current) {
      return;
    }

    const alpha = easeFactor(delta);
    const ambientTarget = isDark ? 0.5 : 0.72;
    const hemisphereTarget = isDark ? 0 : 1.2;
    const keyIntensityTarget = isDark ? 2 : 2.15;
    const fillTarget = isDark ? 0 : 0.55;
    const keyColorTarget = isDark ? DARK_KEY_COLOR : LIGHT_KEY_COLOR;
    const keyPositionTarget = isDark ? DARK_KEY_POSITION : LIGHT_KEY_POSITION;

    ambient.current.intensity = THREE.MathUtils.damp(
      ambient.current.intensity,
      ambientTarget,
      8,
      delta
    );
    hemisphere.current.intensity = THREE.MathUtils.damp(
      hemisphere.current.intensity,
      hemisphereTarget,
      8,
      delta
    );
    keyLight.current.intensity = THREE.MathUtils.damp(
      keyLight.current.intensity,
      keyIntensityTarget,
      8,
      delta
    );
    fillLight.current.intensity = THREE.MathUtils.damp(
      fillLight.current.intensity,
      fillTarget,
      8,
      delta
    );
    keyLight.current.color.lerp(keyColorTarget, alpha);
    keyLight.current.position.lerp(keyPositionTarget, alpha);

    const transitioning =
      Math.abs(ambient.current.intensity - ambientTarget) > 0.002
      || Math.abs(hemisphere.current.intensity - hemisphereTarget) > 0.002
      || Math.abs(keyLight.current.intensity - keyIntensityTarget) > 0.002
      || Math.abs(fillLight.current.intensity - fillTarget) > 0.002
      || colorDistanceSquared(keyLight.current.color, keyColorTarget) > 0.00001
      || keyLight.current.position.distanceToSquared(keyPositionTarget) > 0.0001;

    if (transitioning) state.invalidate();
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={initialLighting.ambient} />
      <hemisphereLight
        ref={hemisphere}
        args={['#e8f5ff', '#b9c9e8', initialLighting.hemisphere]}
      />
      <directionalLight
        ref={keyLight}
        position={initialLighting.keyPosition}
        color={initialLighting.keyColor}
        intensity={initialLighting.keyIntensity}
      />
      <directionalLight
        ref={fillLight}
        position={[4, 1, -2]}
        color="#9fd5ff"
        intensity={initialLighting.fill}
      />
    </>
  );
};

const EarthCanvas = () => {
  const isMobile = useMobile();
  const isWebglSupported = useWebglSupport();
  const { isDark } = useTheme();

  if (!isWebglSupported) {
    return (
      <div className="earth-stage w-full h-full border border-[color:var(--surface-border)] bg-tertiary/60 flex items-center justify-center text-center px-6">
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
  const earthScale = isMobile ? 2.05 : 2.25;

  return (
    <div className={`earth-stage ${wrapperClassName}`}>
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
            autoRotateSpeed={0.45}
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <ThemeLights isDark={isDark} />
          <Earth scale={earthScale} isDark={isDark} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default EarthCanvas;
