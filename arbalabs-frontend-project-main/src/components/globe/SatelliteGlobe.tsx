"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import type { SatellitePosition } from "@/hooks/useTLEPosition";
import { useGLTF } from "@react-three/drei";

export interface GlobeProps {
  onSatelliteUpdate?: (pos: {
    alt: number;
    vel: number;
  }) => void;

  panelMode?: boolean;

  sentinel2A?: SatellitePosition | null;
  sentinel2B?: SatellitePosition | null;
}

function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  const texture = useLoader(
    TextureLoader,
    "/earth.jpg"
  );

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <Sphere ref={earthRef} args={[2, 64, 64]}>
      <meshStandardMaterial map={texture} />
    </Sphere>
  );
}

function Satellite({
  lat,
  lon,
  color,
}: {
  lat: number;
  lon: number;
  color: string;
}) {
  const satRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF("/satellite.glb");

  const position = latLonToVector3(
    lat,
    lon,
    2.2
  );

  useFrame(() => {
    if (satRef.current) {
      satRef.current.lookAt(0, 0, 0);

      // Rotasi satelit
      satRef.current.rotation.z += 0.02;
      satRef.current.rotation.y += 0.01;
    }
  });

  return (
    <primitive
      ref={satRef}
      object={scene.clone()}
      position={position}
      scale={0.02}
    />
  );
}

export default function SatelliteGlobe({
  onSatelliteUpdate,
  panelMode = false,
  sentinel2A,
  sentinel2B,
}: GlobeProps) {

  useEffect(() => {
    if (sentinel2A && onSatelliteUpdate) {

      const alt =
        "alt" in sentinel2A
          ? Number((sentinel2A as any).alt)
          : 786;

      const vel =
        "vel" in sentinel2A
          ? Number((sentinel2A as any).vel)
          : 26640;

      onSatelliteUpdate({
        alt,
        vel,
      });
    }
  }, [sentinel2A, onSatelliteUpdate]);

  return (
    <div className="w-full h-full min-h-[500px] bg-black overflow-hidden">

      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 45,
        }}
      >
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[5, 3, 5]}
          intensity={2}
        />

        <Earth />

        {sentinel2A && (
          <Satellite
            lat={sentinel2A.lat}
            lon={sentinel2A.lon}
            color="#0ea5e9"
          />
        )}

        {sentinel2B && (
          <Satellite
            lat={sentinel2B.lat}
            lon={sentinel2B.lon}
            color="#10b981"
          />
        )}

        <OrbitControls
          enableZoom
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}