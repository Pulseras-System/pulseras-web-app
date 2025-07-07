import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface PartPreviewProps {
    modelPath: string;
    size?: number;
}

const PartPreview: React.FC<PartPreviewProps> = ({ modelPath, size = 100 }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x333333); // Darker background to match the sidebar

        // Camera
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(size, size);
        mountRef.current.appendChild(renderer.domElement);        // Improved lighting for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
        // Add front light for better illumination
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 5);
        scene.add(frontLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableZoom = false;
        controls.autoRotate = true;        // Load model
        const loader = new GLTFLoader();
        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.5 / maxDim; // Reduced scale to fit better in preview
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            
            // Add a small y-offset to ensure the model is fully visible
            model.position.y -= 0.2;
            
            // Apply a visible material for the preview
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // Apply a standard material with a dark color for better contrast
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x222222,
                        metalness: 0.3,
                        roughness: 0.4
                    });
                }
            });
            
            scene.add(model);
        });

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.dispose();
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, [modelPath, size]);

    return <div 
        ref={mountRef} 
        style={{ 
            width: size, 
            height: size, 
            maxHeight: '100%',
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }} 
    />;
};

export default PartPreview;