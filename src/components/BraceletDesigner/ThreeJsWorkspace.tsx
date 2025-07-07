import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RenderedObject, BraceletPart } from './types';
import { debounce } from '../../utils/helpers';

interface ThreeJsWorkspaceProps {
    renderedObjects: RenderedObject[];
    setRenderedObjects: React.Dispatch<React.SetStateAction<RenderedObject[]>>;
    selectedObject: string | null;
    setSelectedObject: (id: string | null) => void;
    dragMode: boolean;
    rotationMode: boolean;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    toggleDragMode: () => void;
    toggleRotationMode: () => void;
    isCapturing: boolean;
    isAutoRotating: boolean;
    onImageCaptured?: (imageData: File) => void; // Add callback for image captured
}

const ThreeJsWorkspace: React.FC<ThreeJsWorkspaceProps> = ({
    renderedObjects,
    setRenderedObjects,
    selectedObject,
    setSelectedObject,
    dragMode,
    rotationMode,
    isLoading,
    setIsLoading,
    error,
    setError,
    toggleDragMode,
    toggleRotationMode,
    isCapturing,
    isAutoRotating,
    onImageCaptured
}) => {
    // Basic references
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null); const animationRef = useRef<number | null>(null); const dragControlsRef = useRef<DragControls | null>(null); const isDraggingRef = useRef<boolean>(false);
    const braceletStringRef = useRef<THREE.Mesh | null>(null);
    const snapPointsRef = useRef<THREE.Vector3[]>([]);

    // Initialize Three.js scene
    useEffect(() => {
        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create gradient background with gray tones
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        if (context) {
            // Create radial gradient from center with gray tones
            const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
            gradient.addColorStop(0, '#6b7280'); // Gray-500 at center
            gradient.addColorStop(0.7, '#4b5563'); // Gray-600 in middle  
            gradient.addColorStop(1, '#374151'); // Gray-700 at edges

            context.fillStyle = gradient;
            context.fillRect(0, 0, 512, 512);
        }

        const texture = new THREE.CanvasTexture(canvas);
        scene.background = texture;

        // Get container dimensions
        const container = mountRef.current;
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 10);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
        });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Modern tone mapping for better contrast
        renderer.toneMappingExposure = 1.2; // Slightly brighter exposure
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // Lighting setup with warmer tones to complement the gradient background
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Slightly reduced ambient
        scene.add(ambientLight);

        // Main directional light with slight warm tint
        const directionalLight = new THREE.DirectionalLight(0xfff8e7, 1.3);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Front fill light with cooler tone
        const frontLight = new THREE.DirectionalLight(0xe7f3ff, 0.6);
        frontLight.position.set(0, 0, 10);
        scene.add(frontLight);

        // Back rim light with purple accent matching the project theme
        const backLight = new THREE.DirectionalLight(0x9c7cfa, 0.3); // Subtle purple tint
        backLight.position.set(0, 0, -10);
        scene.add(backLight);

        // Add hemisphere light for better overall illumination
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x2a3447, 0.4);
        scene.add(hemisphereLight);
        // Grid helper with gray colors
        const gridHelper = new THREE.GridHelper(10, 10, 0x9ca3af, 0x6b7280); // Gray-400 main lines, gray-500 sub lines
        gridHelper.position.y = -0.01; // Slightly below objects to avoid z-fighting
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Create the bracelet string that will always be present
        createBraceletString();

        // Handle window resize
        const handleResize = debounce(() => {
            if (container && cameraRef.current && rendererRef.current) {
                const width = container.clientWidth;
                const height = container.clientHeight;

                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            }
        }, 200);

        window.addEventListener('resize', handleResize);        // Animation loop
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);              // Auto-rotate selected object
            if (isAutoRotating && selectedObject && renderedObjects.length > 0) {
                const selectedObj = renderedObjects.find(obj => obj.id === selectedObject);
                if (selectedObj && selectedObj.object && !isDraggingRef.current) {
                    // Rotate around multiple axes for better 360-degree viewing (much faster)
                    selectedObj.object.rotation.y += 0.08; // Much faster Y-axis rotation
                    selectedObj.object.rotation.x += 0.04; // Faster X-axis rotation
                    selectedObj.object.rotation.z += 0.02; // Faster Z-axis rotation
                }
            }

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            if (rendererRef.current && container) {
                container.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            if (dragControlsRef.current) {
                dragControlsRef.current.dispose();
            }
        };
    }, []);    // Create bracelet string (cylinder base) that always exists in the workspace
    const createBraceletString = () => {
        if (!sceneRef.current) return;

        // Create cylinder geometry for the bracelet string
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 16); // radius top, radius bottom, height, segments
        const material = new THREE.MeshPhongMaterial({
            color: 0xD4AF37, // Gold color for premium look
            shininess: 30,
            transparent: true,
            opacity: 0.95,
            emissive: 0x332200, // Subtle warm glow
            emissiveIntensity: 0.1
        });

        const braceletString = new THREE.Mesh(geometry, material);

        // Position the bracelet string horizontally (rotate 90 degrees around Z axis)
        braceletString.rotation.z = Math.PI / 2;
        braceletString.position.set(0, 0, 0); // Center position

        // Add name to identify this object
        braceletString.name = 'braceletString';
        braceletString.userData = { isBraceletString: true };

        // Enable shadows
        braceletString.castShadow = true;
        braceletString.receiveShadow = true;

        sceneRef.current.add(braceletString);
        braceletStringRef.current = braceletString;        // Create snap points after adding the string to scene
        createSnapPoints();

        console.log('Bracelet string created and added to scene');
    };    // Helper function to create snap points along the bracelet string
    const createSnapPoints = useCallback(() => {
        const snapPoints: THREE.Vector3[] = [];
        const numPoints = 120; // Tăng lên 120 điểm để có mật độ snap cực dày
        const stringLength = 5.5; // Chiều dài dây

        for (let i = 0; i < numPoints; i++) {
            const x = (i - (numPoints - 1) / 2) * (stringLength / (numPoints - 1));
            snapPoints.push(new THREE.Vector3(x, 0, 0)); // Dây nằm dọc theo trục X
        }

        snapPointsRef.current = snapPoints;
        console.log(`Created ${numPoints} snap points on bracelet string with spacing ~${(stringLength / (numPoints - 1)).toFixed(3)} units`);
    }, []);    // Helper function to find the nearest snap point
    const findNearestSnapPoint = useCallback((position: THREE.Vector3): THREE.Vector3 | null => {
        if (snapPointsRef.current.length === 0) return null;

        let nearestPoint: THREE.Vector3 | null = null;
        let minDistance = Infinity;
        const snapRadius = 2.5; // Tăng bán kính snap để dễ hút vào

        // Get positions of all currently rendered objects to avoid overlapping
        const occupiedPositions = renderedObjects.map(obj => obj.object.position);

        for (const snapPoint of snapPointsRef.current) {
            const distance = position.distanceTo(snapPoint);

            // Chỉ xét các điểm trong bán kính snap và gần hơn điểm hiện tại
            if (distance < snapRadius && distance < minDistance) {
                // Check if this snap point is already occupied by another object
                const isOccupied = occupiedPositions.some(occupiedPos => {
                    const testPoint = snapPoint.clone();
                    testPoint.y = 0; // Same Y level as where objects will be placed
                    return occupiedPos.distanceTo(testPoint) < 0.08; // Khoảng cách tối thiểu rất nhỏ để cho phép gắn sát nhau
                });

                if (!isOccupied) {
                    nearestPoint = snapPoint.clone();
                    minDistance = distance;
                }
            }
        }

        return nearestPoint;
    }, [renderedObjects]);    // Helper function to snap object to bracelet string
    const snapToString = useCallback((object: THREE.Object3D) => {
        const nearestSnapPoint = findNearestSnapPoint(object.position);
        if (nearestSnapPoint) {
            // Đặt object vào chính giữa dây (Y = 0) như khi gắn charm thật vào vòng tay
            nearestSnapPoint.y = 0; // Giữa dây, không phải trên dây
            
            // Check if this is a star model and needs special positioning adjustment
            const isStarModel = object.name && object.name.includes('star');
            if (isStarModel) {
                // For star models, ensure they are perfectly centered on the string
                // Calculate the bounding box to get the actual center
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                
                // Adjust the position so the visual center aligns with the bracelet string
                nearestSnapPoint.y = -center.y; // Offset by the model's center offset
                
                console.log('Star charm snapped with center adjustment:', nearestSnapPoint, 'Model center offset:', center.y);
            }
            
            object.position.copy(nearestSnapPoint);
            console.log('Object snapped to bracelet string at position:', nearestSnapPoint);
            return true;
        }
        return false;
    }, [findNearestSnapPoint, renderedObjects]);

    // Load model function
    const loadModel = async (part: BraceletPart) => {
        if (!sceneRef.current) return null;

        try {
            setIsLoading(true);
            setError(null);

            const loader = new GLTFLoader();

            return new Promise<THREE.Object3D>((resolve, reject) => {
                loader.load(
                    part.modelPath,
                    (gltf) => {
                        const model = gltf.scene;

                        // Center model and apply default position/rotation/scale
                        // This will be useful for future auto-positioning features

                        // Apply position, scale, rotation if provided
                        if (part.position) {
                            model.position.copy(part.position);
                        } else {
                            // Default positioning - place slightly above the "floor" for better visibility
                            model.position.set(0, 0.5, 0);
                        }

                        if (part.scale) {
                            model.scale.copy(part.scale);
                        }

                        if (part.rotation) {
                            model.rotation.copy(part.rotation);
                        }

                        // Set the model's name to match the part's ID for easy reference
                        model.name = part.id;

                        // Apply visible materials to all models
                        model.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;

                                // Keep the original material from .glb file but enhance it for better visibility
                                if (child.material) {
                                    // If it's an array of materials, enhance each one
                                    if (Array.isArray(child.material)) {
                                        child.material.forEach((mat) => {
                                            if (mat instanceof THREE.MeshStandardMaterial) {
                                                // Special handling for star models - fix transparency issues
                                                if (part.modelPath.includes('star')) {
                                                    mat.transparent = false;
                                                    mat.opacity = 1.0;
                                                    // Ensure star has a visible color
                                                    if (mat.color.getHex() === 0x000000 || mat.color.getHex() === 0xffffff) {
                                                        mat.color.setHex(0xffd700); // Gold color for stars
                                                    }
                                                }
                                                
                                                // Enhance the existing material properties for better lighting
                                                mat.metalness = mat.metalness || 0.3;
                                                mat.roughness = mat.roughness || 0.4;
                                                // Add slight emissive for visibility without changing base color
                                                if (!mat.emissive || mat.emissive.getHex() === 0) {
                                                    mat.emissive = new THREE.Color(mat.color).multiplyScalar(0.05);
                                                }
                                            } else if (mat instanceof THREE.MeshPhongMaterial) {
                                                // Special handling for star models - fix transparency issues
                                                if (part.modelPath.includes('star')) {
                                                    mat.transparent = false;
                                                    mat.opacity = 1.0;
                                                    // Ensure star has a visible color
                                                    if (mat.color.getHex() === 0x000000 || mat.color.getHex() === 0xffffff) {
                                                        mat.color.setHex(0xffd700); // Gold color for stars
                                                    }
                                                }
                                                
                                                // For Phong materials, enhance shininess
                                                mat.shininess = mat.shininess || 30;
                                                // Add slight emissive for visibility without changing base color
                                                if (!mat.emissive || mat.emissive.getHex() === 0) {
                                                    mat.emissive = new THREE.Color(mat.color).multiplyScalar(0.05);
                                                }
                                            }
                                        });
                                    } else {
                                        // Single material enhancement
                                        if (child.material instanceof THREE.MeshStandardMaterial) {
                                            // Special handling for star models - fix transparency issues
                                            if (part.modelPath.includes('star')) {
                                                child.material.transparent = false;
                                                child.material.opacity = 1.0;
                                                // Ensure star has a visible color
                                                if (child.material.color.getHex() === 0x000000 || child.material.color.getHex() === 0xffffff) {
                                                    child.material.color.setHex(0xffd700); // Gold color for stars
                                                }
                                            }
                                            
                                            // Enhance the existing material properties for better lighting
                                            child.material.metalness = child.material.metalness || 0.3;
                                            child.material.roughness = child.material.roughness || 0.4;
                                            // Add slight emissive for visibility without changing base color
                                            if (!child.material.emissive || child.material.emissive.getHex() === 0) {
                                                child.material.emissive = new THREE.Color(child.material.color).multiplyScalar(0.05);
                                            }
                                        } else if (child.material instanceof THREE.MeshPhongMaterial) {
                                            // Special handling for star models - fix transparency issues
                                            if (part.modelPath.includes('star')) {
                                                child.material.transparent = false;
                                                child.material.opacity = 1.0;
                                                // Ensure star has a visible color
                                                if (child.material.color.getHex() === 0x000000 || child.material.color.getHex() === 0xffffff) {
                                                    child.material.color.setHex(0xffd700); // Gold color for stars
                                                }
                                            }
                                            
                                            // For Phong materials, enhance shininess
                                            child.material.shininess = child.material.shininess || 30;
                                            // Add slight emissive for visibility without changing base color
                                            if (!child.material.emissive || child.material.emissive.getHex() === 0) {
                                                child.material.emissive = new THREE.Color(child.material.color).multiplyScalar(0.05);
                                            }
                                        }
                                    }
                                } else {
                                    // Fallback: if no material exists, create a basic one
                                    if (part.modelPath.includes('star')) {
                                        child.material = new THREE.MeshStandardMaterial({
                                            color: 0xffd700, // Gold color for stars
                                            metalness: 0.5,
                                            roughness: 0.3,
                                            transparent: false,
                                            opacity: 1.0
                                        });
                                    } else {
                                        child.material = new THREE.MeshStandardMaterial({
                                            color: 0xcccccc, // Light gray fallback
                                            metalness: 0.3,
                                            roughness: 0.4
                                        });
                                    }
                                }
                            }
                        });

                        resolve(model);
                    },
                    () => {
                        // Progress callback (not used now but keeping for future enhancements)
                    },
                    (error) => {
                        console.error('Error loading model:', error);
                        setError(`Failed to load model: ${error.message}`);
                        reject(error);
                    }
                );
            });
        } catch (err: any) {
            console.error('Error in loadModel:', err);
            setError(`Error loading model: ${err.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Update drag controls to manage objects in the scene
    const updateDragControls = () => {
        if (!cameraRef.current || !rendererRef.current || !controlsRef.current) return;

        // Get all the objects that should be draggable
        const draggableObjects = renderedObjects.map(obj => obj.object);

        // Dispose of existing drag controls if they exist
        if (dragControlsRef.current) {
            dragControlsRef.current.dispose();
        }

        // Only create drag controls if there are objects to drag
        if (draggableObjects.length > 0 && rendererRef.current.domElement) {
            // Create new drag controls
            const dragControls = new DragControls(
                draggableObjects,
                cameraRef.current,
                rendererRef.current.domElement
            );

            // Configure drag controls
            dragControls.addEventListener('dragstart', (event) => {
                // Disable orbit controls during drag
                if (controlsRef.current) {
                    controlsRef.current.enabled = false;
                }

                // Set the dragging state
                isDraggingRef.current = true;

                // Find the object being dragged
                const draggedObjectId = renderedObjects.find(
                    obj => obj.object === event.object
                )?.id;

                // Set it as the selected object
                if (draggedObjectId) {
                    setSelectedObject(draggedObjectId);
                }

                // Change cursor
                document.body.style.cursor = 'grabbing';
            });

            dragControls.addEventListener('drag', (event) => {
                // Update the position in our data model
                const draggedObject = renderedObjects.find(obj => obj.object === event.object);
                if (draggedObject) {
                    // Clone the position to avoid reference issues
                    draggedObject.partData.position = new THREE.Vector3(
                        event.object.position.x,
                        event.object.position.y,
                        event.object.position.z
                    );
                }
            });
            dragControls.addEventListener('dragend', (event) => {
                // Try to snap the object to the bracelet string
                const snapped = snapToString(event.object);

                // Update the position in our data model after potential snapping
                const draggedObject = renderedObjects.find(obj => obj.object === event.object);
                if (draggedObject) {
                    draggedObject.partData.position = new THREE.Vector3(
                        event.object.position.x,
                        event.object.position.y,
                        event.object.position.z
                    );
                }

                // Re-enable orbit controls after drag
                if (controlsRef.current) {
                    controlsRef.current.enabled = true;
                }

                // Reset dragging state
                isDraggingRef.current = false;

                // Reset cursor
                document.body.style.cursor = 'auto';

                if (snapped) {
                    console.log('Object snapped to bracelet string');
                }
            });

            // Also add hover events for better UX
            dragControls.addEventListener('hoveron', (event) => {
                // Change cursor on hover
                document.body.style.cursor = 'grab';

                // Add hover effect (optional)
                const hoveredObject = renderedObjects.find(obj => obj.object === event.object);
                if (hoveredObject) {
                    // You can add a visual hover effect here if desired
                }
            });

            dragControls.addEventListener('hoveroff', () => {
                // Reset cursor when not hovering
                if (!isDraggingRef.current) {
                    document.body.style.cursor = 'auto';
                }
            });

            // Enable/disable based on drag mode
            dragControls.enabled = dragMode;

            // Save the drag controls for future reference
            dragControlsRef.current = dragControls;
        }
    };

    // Effect to update drag controls when rendered objects change
    useEffect(() => {
        updateDragControls();
    }, [renderedObjects]);

    // Helper function to highlight selected object
    const highlightSelectedObject = (id: string | null) => {
        // Remove highlight from all objects
        renderedObjects.forEach(({ object }) => {
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    // Reset material to original state (if we stored it)
                    // For simplicity, just setting a default emissive color here
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat) => {
                                if (mat.emissive) mat.emissive.set(0x000000);
                            });
                        } else if (child.material.emissive) {
                            child.material.emissive.set(0x000000);
                        }
                    }
                }
            });
        });

        // Add highlight to the selected object
        if (id) {
            const selectedObj = renderedObjects.find(obj => obj.id === id);
            if (selectedObj) {
                selectedObj.object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        // Add a highlight effect
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((mat) => {
                                    if (mat.emissive) mat.emissive.set(0x555500);
                                });
                            } else if (child.material.emissive) {
                                child.material.emissive.set(0x555500);
                            }
                        }
                    }
                });
            }
        }
    };

    // Effect to update the highlighted object when selection changes
    useEffect(() => {
        highlightSelectedObject(selectedObject);
    }, [selectedObject]);

    // Function to capture and save the workspace as an image
    // const captureWorkspaceImage = () => {
    //     if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
    //         console.error('Renderer, scene, or camera not initialized');
    //         return;
    //     }

    //     try {
    //         // Force render to ensure the latest state is captured
    //         rendererRef.current.render(sceneRef.current, cameraRef.current);

    //         // Get the canvas element
    //         const canvas = rendererRef.current.domElement;

    //         // Convert canvas to blob
    //         canvas.toBlob((blob) => {
    //             if (blob) {
    //                 // Create a download link
    //                 const url = URL.createObjectURL(blob);
    //                 const link = document.createElement('a');
    //                 link.href = url;
    //                 link.download = `bracelet-design-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    //                 document.body.appendChild(link);
    //                 link.click();
    //                 document.body.removeChild(link);
    //                 URL.revokeObjectURL(url);
    //             }
    //         }, 'image/png');
    //     } catch (error) {
    //         console.error('Error capturing workspace image:', error);
    //     }
    // };    // Convert the workspace image to a base64 string
    // const convertImageToBase64 = () => {
    //     return new Promise<string>((resolve, reject) => {
    //         if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
    //             return reject('Renderer, scene, or camera not initialized');
    //         }

    //         try {
    //             // Force render to ensure the latest state is captured
    //             rendererRef.current.render(sceneRef.current, cameraRef.current);

    //             // Get the canvas element
    //             const canvas = rendererRef.current.domElement;

    //             // Convert canvas to base64 string
    //             const imageData = canvas.toDataURL('image/png');

    //             resolve(imageData);
    //         } catch (error) {
    //             console.error('Error converting image to base64:', error);
    //             reject('Failed to convert image to base64');
    //         }
    //     });
    // };    // Effect to handle image capture when isCapturing flag changes
    useEffect(() => {
        if (
            isCapturing &&
            rendererRef.current &&
            sceneRef.current &&
            cameraRef.current
        ) {
            // render frame
            rendererRef.current.render(sceneRef.current, cameraRef.current);

            // capture to blob
            rendererRef.current.domElement.toBlob(
                (blob) => {
                    if (!blob) {
                        console.error("toBlob() returned null");
                        return;
                    }

                    const file = new File([blob], "custom-bracelet.png", {
                        type: blob.type,
                    });

                    // global temp callback
                    if ((window as any).tempImageCaptureCallback) {
                        (window as any).tempImageCaptureCallback(file);
                    }

                    // normal prop callback
                    if (onImageCaptured) {
                        onImageCaptured(file);
                    }
                },
                "image/png",
                0.92
            );
        }
    }, [isCapturing, onImageCaptured]);



    // Track objects removal
    useEffect(() => {
        // If there's no scene yet, do nothing
        if (!sceneRef.current) return;

        // Create a map of all objects that should be in the scene
        const currentObjectsMap = new Map<string, THREE.Object3D>();
        renderedObjects.forEach(obj => {
            currentObjectsMap.set(obj.id, obj.object);
        });

        // Find objects to remove
        const objectsToRemove: THREE.Object3D[] = [];
        // Go through all children in the scene that are top-level objects (not lights, camera, etc.)
        sceneRef.current.children.forEach(child => {
            // Skip built-in scene elements and bracelet string
            if (child.type === 'GridHelper' ||
                child.type === 'DirectionalLight' ||
                child.type === 'AmbientLight' ||
                child instanceof THREE.Camera ||
                child.userData?.isBraceletString) {
                return;
            }

            // If this is a bracelet part (has a name that matches an ID) but not in our rendered objects
            if (child.name && !currentObjectsMap.has(child.name)) {
                objectsToRemove.push(child);
            }
        });

        // Remove all objects that were marked for removal
        if (objectsToRemove.length > 0) {
            console.log(`Removing ${objectsToRemove.length} objects from scene`);

            objectsToRemove.forEach((object) => {
                // Dispose of geometries and materials to prevent memory leaks
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        if (child.geometry) {
                            child.geometry.dispose();
                        }

                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach((material) => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });

                // Remove from scene
                sceneRef.current?.remove(object);
            });
        }
    }, [renderedObjects]);

    // Handle drag over for the workspace
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // We can add visual feedback here in the future
    };

    // Handle dropping a part into the workspace
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        try {
            // Get the part data from the drag event
            const partData = JSON.parse(e.dataTransfer.getData('application/json')) as BraceletPart;

            // Get drop coordinates relative to the container
            const containerRect = mountRef.current?.getBoundingClientRect();
            if (!containerRect) return;
            // Calculate normalized coordinates (-1 to 1) for positioning
            const x = ((e.clientX - containerRect.left) / containerRect.width) * 8 - 4; // Reduced range for closer placement
            const y = -((e.clientY - containerRect.top) / containerRect.height) * 6 + 3; // Adjusted for better placement near bracelet string

            // Clamp Y position to be close to the bracelet string (around Y=0)
            const clampedY = Math.max(-1, Math.min(1, y));

            // Generate a unique ID for this specific instance
            const instanceId = `${partData.id}-${Date.now()}`;

            // Create a new part with the instance ID
            const newPartInstance = {
                ...partData,
                id: instanceId,
                // Use the calculated drop position, keep parts close to bracelet string
                position: new THREE.Vector3(x, clampedY, 0)
            };
            // Load the model
            const modelObject = await loadModel(newPartInstance);

            if (modelObject && sceneRef.current) {
                // Add to scene
                sceneRef.current.add(modelObject);

                // Try to snap the new object to the bracelet string
                const snapped = snapToString(modelObject);

                // Update the part data with the final position (after potential snapping)
                newPartInstance.position = new THREE.Vector3(
                    modelObject.position.x,
                    modelObject.position.y,
                    modelObject.position.z
                );

                // Update state with the new object
                setRenderedObjects(prev => [
                    ...prev,
                    {
                        id: instanceId,
                        object: modelObject,
                        partData: newPartInstance
                    }
                ]);

                // Set as selected object
                setSelectedObject(instanceId);

                if (snapped) {
                    console.log('New part automatically snapped to bracelet string');
                }
            }
        } catch (err) {
            console.error('Error handling drop:', err);
            setError('Failed to add part to the workspace');
        }
    };

    return (
        <div
            ref={mountRef}
            style={{
                flex: 1,
                position: 'relative',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)', // Gray gradient background
                borderLeft: '1px solid #6b7280',
                borderRight: '1px solid #6b7280',
                overflow: 'hidden'
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{ fontWeight: '500' }}>Loading...</span>
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: 'rgba(255, 65, 65, 0.9)',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 10px rgba(255,65,65,0.3)'
                }}>
                    <span style={{ fontSize: '18px' }}>⚠</span>
                    <span style={{ fontWeight: '500' }}>{error}</span>
                </div>
            )}

            {/* Helper text for bracelet string */}
            {renderedObjects.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(75, 85, 99, 0.9))',
                    color: 'white',
                    padding: '25px 30px',
                    borderRadius: '15px',
                    zIndex: 10,
                    textAlign: 'center',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(107, 114, 128, 0.2)'
                }}>
                    <div style={{ fontSize: '20px', marginBottom: '12px', color: '#D4AF37' }}>
                        ✨ Golden Bracelet Base Ready
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#ddd' }}>
                        Drag and drop charms from the library to create your bracelet!<br />
                        <span style={{ color: '#D4AF37' }}>The golden string</span> is your premium bracelet base.
                    </div>
                </div>
            )}

            {/* Control Buttons */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                zIndex: 10,
                display: 'flex',
                gap: '10px'
            }}>
                {/* Drag Mode Toggle Button */}
                <button
                    onClick={toggleDragMode}
                    style={{
                        background: dragMode ?
                            'linear-gradient(135deg, #9ca3af, #6b7280)' :
                            'linear-gradient(135deg, rgba(85, 85, 85, 0.8), rgba(55, 55, 55, 0.8))',
                        color: 'white',
                        border: dragMode ? '1px solid rgba(156, 163, 175, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        boxShadow: dragMode ?
                            '0 4px 15px rgba(156, 163, 175, 0.3)' :
                            '0 4px 6px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = dragMode ?
                            '0 6px 20px rgba(156, 163, 175, 0.4)' :
                            '0 6px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = dragMode ?
                            '0 4px 15px rgba(156, 163, 175, 0.3)' :
                            '0 4px 6px rgba(0,0,0,0.2)';
                    }}
                >
                    <span style={{ fontSize: '16px' }}>
                        {dragMode ? '✓' : '✗'}
                    </span>
                    {dragMode ? 'Drag: ON' : 'Drag: OFF'}
                </button>

                {/* Rotation Mode Toggle Button */}
                <button
                    onClick={toggleRotationMode}
                    style={{
                        background: rotationMode ?
                            'linear-gradient(135deg, #FF9800, #FFB74D)' :
                            'linear-gradient(135deg, rgba(85, 85, 85, 0.8), rgba(55, 55, 55, 0.8))',
                        color: 'white',
                        border: rotationMode ? '1px solid rgba(255, 152, 0, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        boxShadow: rotationMode ?
                            '0 4px 15px rgba(255, 152, 0, 0.3)' :
                            '0 4px 6px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = rotationMode ?
                            '0 6px 20px rgba(255, 152, 0, 0.4)' :
                            '0 6px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = rotationMode ?
                            '0 4px 15px rgba(255, 152, 0, 0.3)' :
                            '0 4px 6px rgba(0,0,0,0.2)';
                    }}
                >
                    <span style={{ fontSize: '16px' }}>
                        {rotationMode ? '↻' : '↺'}
                    </span>
                    {rotationMode ? 'Rotate: ON' : 'Rotate: OFF'}
                </button>
            </div>

            {/* Instructions Overlay */}
            {renderedObjects.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(0, 0, 0, 0.8))',
                    color: 'white',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    zIndex: 10,
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 4px 20px rgba(107, 114, 128, 0.15)',
                    border: '1px solid rgba(156, 163, 175, 0.2)',
                    maxWidth: '280px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: dragMode ? '8px' : '0'
                    }}>
                        <span style={{
                            fontSize: '14px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: dragMode ?
                                'linear-gradient(135deg, #9ca3af, #6b7280)' :
                                'linear-gradient(135deg, #555, #777)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: dragMode ? '0 0 10px rgba(156, 163, 175, 0.5)' : 'none'
                        }}>
                            {dragMode ? '✓' : '✗'}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>
                            {dragMode ? 'Drag Mode Active' : 'Drag Mode Inactive'}
                        </span>
                    </div>

                    {dragMode && (
                        <p style={{
                            margin: '0',
                            fontSize: '13px',
                            color: '#ddd',
                            lineHeight: '1.4'
                        }}>
                            Click and drag objects to reposition them
                        </p>
                    )}
                </div>
            )}

            {/* Drag and Drop Guide Overlay */}
            {renderedObjects.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(0, 0, 0, 0.8))',
                    color: 'white',
                    padding: '25px 35px',
                    borderRadius: '15px',
                    zIndex: 10,
                    textAlign: 'center',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 8px 32px rgba(107, 114, 128, 0.15)',
                    maxWidth: '450px',
                    border: '1px solid rgba(156, 163, 175, 0.2)'
                }}>
                    <div style={{
                        fontSize: '36px',
                        marginBottom: '18px',
                        color: '#9ca3af',
                        textShadow: '0 0 20px rgba(156, 163, 175, 0.5)'
                    }}>
                        ↓
                    </div>
                    <h3 style={{
                        margin: '0 0 12px 0',
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: '20px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        Drag Parts Here
                    </h3>
                    <p style={{
                        color: '#ddd',
                        margin: '0',
                        lineHeight: '1.5'
                    }}>
                        Drag items from the left panel and drop them in this workspace to build your custom bracelet
                    </p>
                </div>
            )}
        </div>
    );
};

export default ThreeJsWorkspace;
