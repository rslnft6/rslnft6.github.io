import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface VRViewProps {
  src: string;
}

const VRView: React.FC<VRViewProps> = ({ src }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let animationId: number | null = null;
    let sphere: THREE.Mesh | null = null;
    if (mountRef.current) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, 400);
      mountRef.current.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / 400, 0.1, 1000);
      camera.position.set(0, 0, 0.1);
      // تحميل صورة بانوراما كنسيج على كرة
      const loader = new THREE.TextureLoader();
      loader.load(src, (texture) => {
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        sphere = new THREE.Mesh(geometry, material);
        if (scene) scene.add(sphere);
      });
      // تحكم بالفأرة للدوران
      let lon = 0, lat = 0;
      let isDragging = false;
      let lastX = 0, lastY = 0;
      const onPointerDown = (e: MouseEvent) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      const onPointerUp = () => { isDragging = false; };
      const onPointerMove = (e: MouseEvent) => {
        if (!isDragging) return;
        lon -= (e.clientX - lastX) * 0.1;
        lat += (e.clientY - lastY) * 0.1;
        lastX = e.clientX;
        lastY = e.clientY;
      };
      renderer.domElement.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('mousemove', onPointerMove);
      // حركة الكاميرا
      const animate = () => {
        lat = Math.max(-85, Math.min(85, lat));
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);
        if (camera) {
          const target = new THREE.Vector3();
          target.x = 500 * Math.sin(phi) * Math.cos(theta);
          target.y = 500 * Math.cos(phi);
          target.z = 500 * Math.sin(phi) * Math.sin(theta);
          camera.lookAt(target);
        }
        if (renderer && scene && camera) renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };
      animate();
      // تنظيف
      return () => {
        renderer?.domElement.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('mousemove', onPointerMove);
      };
    }
    return () => {
      if (renderer && mountRef.current) {
        const r = renderer as THREE.WebGLRenderer;
        if (r.domElement && mountRef.current.contains(r.domElement)) {
          mountRef.current.removeChild(r.domElement);
        }
        r.dispose();
      }
      if (animationId) cancelAnimationFrame(animationId);
      if (scene && sphere) {
        (scene as THREE.Scene).remove(sphere);
        (sphere.geometry as THREE.BufferGeometry).dispose();
        (sphere.material as THREE.Material).dispose();
      }
    };
  }, [src]);

  return <div ref={mountRef} style={{ width: '100%', height: 400, borderRadius: 16, margin: '32px 0', background: '#e0eafc' }} />;
};

export default VRView;
