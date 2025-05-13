import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

const DesignBraceletPage: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scene, Camera, Renderer setup    
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc); // Light gray background
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Create bracelet as a chain of cylinders
        const braceletSegments: THREE.Mesh[] = [];
        const segmentGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16); // Giảm chiều dài của hình trụ
        const segmentMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Gold color

        const segmentCount = 96; // Tăng số lượng đoạn để làm dây vòng mịn hơn
        const braceletRadius = 3; // Radius of the bracelet

        for (let i = 0; i < segmentCount; i++) {
            const angle = (i / segmentCount) * Math.PI * 2;
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            segment.position.set(
                Math.cos(angle) * braceletRadius,
                Math.sin(angle) * braceletRadius,
                0
            );
            segment.rotation.z = angle; // Rotate the segment to align with the circle
            segment.castShadow = true;
            scene.add(segment);
            braceletSegments.push(segment);
        }

        // Define anchor points on the bracelet
        const anchorPoints: THREE.Vector3[] = [];
        for (let i = 0; i < segmentCount; i++) {
            const angle = (i / segmentCount) * Math.PI * 2;
            anchorPoints.push(new THREE.Vector3(
                Math.cos(angle) * braceletRadius,
                Math.sin(angle) * braceletRadius,
                0
            ));
        }

        // Add draggable objects (cubes and spheres)
        const draggableObjects: THREE.Object3D[] = [];
        const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        for (let i = 0; i < 12; i++) {
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(5, 0, 0); // Start cubes off to the side
            cube.castShadow = true;
            scene.add(cube);
            draggableObjects.push(cube);
        }

        const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        for (let i = 0; i < 12; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(-5, 0, 0); // Start spheres off to the side
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

        dragControls.addEventListener('dragend', (event) => {
            controls.enabled = true;

            // Snap to nearest anchor point
            const draggedObject = event.object;
            let closestPoint = null;
            let minDistance = Infinity;

            anchorPoints.forEach((point) => {
                const distance = draggedObject.position.distanceTo(point);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            });

            // If within snapping range, snap to the closest point
            const snappingRange = 0.5; // Adjust snapping range as needed
            if (closestPoint && minDistance < snappingRange) {
                draggedObject.position.copy(closestPoint);
            }
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