import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { debounce } from 'lodash';
import PartPreview from '../../components/PartPreview';

interface BraceletPart {
    id: string;
    name: string;
    modelPath: string;
    thumbnail?: string;
}

const DesignBraceletPage: React.FC = () => {
    // Thêm ref cho controls
    const controlsRef = useRef<OrbitControls | null>(null);
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null); // Add scene reference
    const [objects, setObjects] = useState<THREE.Object3D[]>([]); // State để lưu danh sách khối
    const [availableParts, setAvailableParts] = useState<BraceletPart[]>([
        {
            id: 'base-bracelet',
            name: 'Base Bracelet',
            modelPath: '/models/base-bracelet.glb'
        },
        {
            id: 'charm-heart',
            name: 'Heart Charm',
            modelPath: '/models/heart-charm.glb'
        },
        {
            id: 'charm-star',
            name: 'Star Charm',
            modelPath: '/models/star-charm.glb'
        },
        {
            id: 'block-gem',
            name: 'Gem Block',
            modelPath: '/scene.glb' // Replace with actual model path
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePosition = useRef({ x: 0, y: 0 });
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    const loadModel = async (partData: BraceletPart, position?: THREE.Vector3) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const gltfLoader = new GLTFLoader();
            gltfLoader.load(
                partData.modelPath,
                (gltf) => {
                    const model = gltf.scene;
                    model.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            const mesh = child as THREE.Mesh;
                            mesh.castShadow = true;
                            mesh.receiveShadow = true;
                        }
                    });
                    
                    if (position) {
                        model.position.copy(position);
                    }
                    
                    if (sceneRef.current) {
                        sceneRef.current.add(model);
                        setObjects((prevObjects) => [...prevObjects, model]);
                    }
                    setIsLoading(false);
                },
                (xhr) => {
                    const progress = (xhr.loaded / xhr.total) * 100;
                    console.log(`Loading: ${progress}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    setError('Failed to load model');
                    setIsLoading(false);
                }
            );
        } catch (err) {
            setError('Failed to load model');
            setIsLoading(false);
        }
    };

    // Cập nhật handleObjectSelection
    const handleObjectSelection = (event: React.MouseEvent) => {
        if (!sceneRef.current || !mountRef.current || !cameraRef.current) return;

        // Vô hiệu hóa controls khi bắt đầu kéo
        if (controlsRef.current) {
            controlsRef.current.enabled = false;
        }

        const rect = mountRef.current.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(objects, true);

        if (intersects.length > 0) {
            const selected = intersects[0].object;
            const parentObject = selected.parent;
            if (parentObject && objects.includes(parentObject)) {
                setSelectedObject(parentObject);
                setIsDragging(true);
            }
        } else {
            setSelectedObject(null);
        }
    };

    // Cập nhật handleDragEnd
    const handleDragEnd = () => {
        // Kích hoạt lại controls khi kết thúc kéo
        if (controlsRef.current) {
            controlsRef.current.enabled = true;
        }
        setIsDragging(false);
    };

    // Thêm hàm xử lý di chuyển khối
    const handleObjectDrag = (event: React.MouseEvent) => {
        if (!isDragging || !selectedObject || !mountRef.current || !cameraRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
        const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const targetPosition = new THREE.Vector3();
        raycasterRef.current.ray.intersectPlane(intersectPlane, targetPosition);

        selectedObject.position.copy(targetPosition);
    };

    // Thêm hàm xử lý phím
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!cameraRef.current) return;
        const speed = 0.5;

        switch (event.key) {
            case 'ArrowUp':
                cameraRef.current.position.y += speed;
                break;
            case 'ArrowDown':
                cameraRef.current.position.y -= speed;
                break;
            case 'ArrowLeft':
                cameraRef.current.position.x -= speed;
                break;
            case 'ArrowRight':
                cameraRef.current.position.x += speed;
                break;
            case '+':
            case '=':
                cameraRef.current.position.z -= speed;
                break;
            case '-':
            case '_':
                cameraRef.current.position.z += speed;
                break;
            case 'r':
            case 'R':
                // Reset camera
                cameraRef.current.position.set(0, 0, 8);
                cameraRef.current.lookAt(0, 0, 0);
                break;
        }
    };

    // Thêm xử lý pan camera với chuột phải
    const handleMouseDown = (event: React.MouseEvent) => {
        if (event.button === 2) { // Chuột phải
            setIsPanning(true);
            lastMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
            event.preventDefault();
        } else {
            handleObjectSelection(event);
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (isDragging) {
            handleObjectDrag(event);
        } else if (isPanning && cameraRef.current) {
            const deltaX = event.clientX - lastMousePosition.current.x;
            const deltaY = event.clientY - lastMousePosition.current.y;
            
            cameraRef.current.position.x -= deltaX * 0.01;
            cameraRef.current.position.y += deltaY * 0.01;
            
            lastMousePosition.current = {
                x: event.clientX,
                y: event.clientY
            };
        }
    };

    const handleMouseUp = (event: React.MouseEvent) => {
        if (event.button === 2) {
            setIsPanning(false);
        } else {
            handleDragEnd();
        }
    };

    // Thêm wheel zoom
    const handleWheel = (event: WheelEvent) => {
        if (!cameraRef.current) return;
        const zoomSpeed = 0.5;
        cameraRef.current.position.z += event.deltaY * 0.01 * zoomSpeed;
    };

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene; // Store scene reference
        scene.background = new THREE.Color(0xcccccc);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            (window.innerWidth - 300) / (window.innerHeight - 150), // Trừ đi chiều cao của header và footer (75px * 2 = 150px)
            0.1,
            1000
        );
        camera.position.z = 8;
        cameraRef.current = camera; // Store camera reference

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
        controlsRef.current = controls; // Lưu reference đến controls

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
            if (controlsRef.current) {
                controlsRef.current.update();
            }
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
        const debouncedResize = debounce(handleResize, 150);
        window.addEventListener('resize', debouncedResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', debouncedResize);
            debouncedResize.cancel();
            // Cleanup models
            objects.forEach(object => {
                object.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;
                        mesh.geometry.dispose();
                        if (mesh.material instanceof THREE.Material) {
                            mesh.material.dispose();
                        }
                    }
                });
            });
            
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
        };
    }, []);

    // Cập nhật div workspace
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div
                style={{
                    width: '300px',
                    background: '#f5f5f5',
                    borderRight: '1px solid #ddd',
                    padding: '10px',
                    overflowY: 'auto',
                }}
            >
                <h3>Available Parts</h3>
                <div style={{ display: 'grid', gap: '10px', padding: '10px' }}>
                    {availableParts.map((part) => (
                        <div
                            key={part.id}
                            draggable
                            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                                e.dataTransfer.setData('application/json', JSON.stringify(part));
                            }}
                            style={{
                                padding: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'grab',
                                background: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <PartPreview modelPath={part.modelPath} size={150} />
                            <span style={{ fontWeight: '500' }}>{part.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Three.js Canvas */}
            <div
                ref={mountRef}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                }}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    try {
                        const partData = JSON.parse(e.dataTransfer.getData('application/json')) as BraceletPart;
                        
                        const gltfLoader = new GLTFLoader();
                        gltfLoader.load(
                            partData.modelPath,
                            (gltf) => {
                                const model = gltf.scene;
                                model.traverse((child) => {
                                    if ((child as THREE.Mesh).isMesh) {
                                        const mesh = child as THREE.Mesh;
                                        mesh.castShadow = true;
                                        mesh.receiveShadow = true;
                                    }
                                });
                                
                                const rect = mountRef.current?.getBoundingClientRect();
                                if (rect) {
                                    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                                    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                                    model.position.set(x * 5, y * 5, 0);
                                }
                                
                                if (sceneRef.current) {
                                    sceneRef.current.add(model);
                                    setObjects((prevObjects) => [...prevObjects, model]);
                                }
                            },
                            undefined,
                            (error) => {
                                console.error('Error loading model:', error);
                            }
                        );
                    } catch (err) {
                        console.error('Invalid drag data');
                    }
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
                style={{
                    flex: 1,
                    position: 'relative',
                    margin: 0,
                    padding: 0,
                    cursor: isPanning ? 'move' : isDragging ? 'grabbing' : 'default'
                }}
            />
        </div>
    );
};

export default DesignBraceletPage;