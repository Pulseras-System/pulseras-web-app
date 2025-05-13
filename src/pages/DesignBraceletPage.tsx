import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

const DesignBraceletPage: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scene, Camera, Renderer setup    
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x999999); // Light gray background
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Add bracelet (torus)
        const torusGeometry = new THREE.TorusGeometry(3, 0.2, 16, 100);
        const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Gold color
        const bracelet = new THREE.Mesh(torusGeometry, torusMaterial);
        bracelet.castShadow = true;
        scene.add(bracelet);

        // Add small cubes and spheres to the side
        const draggableObjects: THREE.Object3D[] = [];
        const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        for (let i = 0; i < 12; i++) {
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            const angle = (i / 12) * Math.PI * 2;
            cube.position.set(Math.cos(angle) * 3 + 5, Math.sin(angle) * 3, 0); // Shift cubes to the right
            cube.castShadow = true;
            scene.add(cube);
            draggableObjects.push(cube);
        }

        const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        for (let i = 0; i < 12; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            const angle = (i / 12) * Math.PI * 2 + Math.PI / 24; // Offset spheres slightly
            sphere.position.set(Math.cos(angle) * 3 + 5, Math.sin(angle) * 3, 0.5); // Shift spheres to the right
            sphere.castShadow = true;
            scene.add(sphere);
            draggableObjects.push(sphere);
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        pointLight.castShadow = true;
        scene.add(pointLight);

        camera.position.z = 8;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Smooth controls
        controls.dampingFactor = 0.05;

        // Drag Controls
        const dragControls = new DragControls(draggableObjects, camera, renderer.domElement);

        // Disable OrbitControls while dragging
        dragControls.addEventListener('dragstart', () => {
            controls.enabled = false;
        });

        dragControls.addEventListener('dragend', () => {
            controls.enabled = true;
        });

        // Animation loop
        const animate = () => {
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        />
    );
};

export default DesignBraceletPage;