import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const DesignBraceletPage: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [objects, setObjects] = useState<THREE.Object3D[]>([]); // State để lưu danh sách khối

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            (window.innerWidth - 300) / (window.innerHeight - 150), // Trừ đi chiều cao của header và footer (75px * 2 = 150px)
            0.1,
            1000
        );
        camera.position.z = 8;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;

        const updateDimensions = () => {
            if (mountRef.current) {
                const containerHeight = window.innerHeight - 150; // Trừ đi chiều cao của header và footer (75px * 2 = 150px)
                const containerWidth = window.innerWidth - 300; // Trừ đi chiều rộng của sidebar
                
                renderer.setSize(containerWidth, containerHeight);
                camera.aspect = containerWidth / containerHeight;
                camera.updateProjectionMatrix();
            }
        };

        // Gọi ngay khi khởi tạo
        updateDimensions();

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        pointLight.castShadow = true;
        scene.add(pointLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Load GLB model
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
            '/scene.glb', // Replace with the path to your GLB file
            (gltf) => {
                const model = gltf.scene;
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                    }
                });
                model.position.set(0, 0, 0); // Set the position of the loaded model
                scene.add(model);

                // Cập nhật danh sách khối
                setObjects((prevObjects) => [...prevObjects, model]);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.error('An error occurred while loading the GLB file:', error);
            }
        );

        // Animation loop
        const animate = () => {
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            updateDimensions();
        };

        // Initial resize
        handleResize();

        // Add resize event listener
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
        <div style={{ 
            display: 'flex', 
            height: 'calc(100vh - 150px)', // Trừ đi chiều cao của header và footer (75px * 2 = 150px)
            overflow: 'hidden',
            margin: 0, // Thêm margin 0
            padding: 0, // Thêm padding 0
        }}>
            {/* Sidebar */}
            <div
                style={{
                    width: '300px',
                    background: '#f5f5f5',
                    borderRight: '1px solid #ddd',
                    padding: '10px',
                    overflowY: 'auto',
                    margin: 0, // Thêm margin 0
                }}
            >
                <h3>Objects in Scene</h3>
                <ul>
                    {objects.map((obj, index) => (
                        <li key={index}>
                            {obj.name || `Object ${index + 1}`}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Three.js Canvas */}
            <div
                ref={mountRef}
                style={{
                    flex: 1,
                    position: 'relative',
                    margin: 0, // Thêm margin 0
                    padding: 0, // Thêm padding 0
                }}
            />
        </div>
    );
};

export default DesignBraceletPage;