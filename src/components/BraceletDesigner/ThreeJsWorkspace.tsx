import React, { useRef, useEffect } from 'react';
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
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    toggleDragMode: () => void;
    isCapturing: boolean;
}

const ThreeJsWorkspace: React.FC<ThreeJsWorkspaceProps> = ({
    renderedObjects,
    setRenderedObjects,
    selectedObject,
    setSelectedObject,
    dragMode,
    isLoading,
    setIsLoading,
    error,
    setError,
    toggleDragMode,
    isCapturing
}) => {
    // Basic references
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationRef = useRef<number | null>(null);
    const dragControlsRef = useRef<DragControls | null>(null);
    const isDraggingRef = useRef<boolean>(false);

    // Initialize Three.js scene
    useEffect(() => {
        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x1e1e1e); // Dark background
        
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
            alpha: true // Enable alpha channel
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
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9); // Increased ambient light intensity
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); 
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Add more lights from different angles for better visibility
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 10);
        scene.add(frontLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(0, 0, -10);
        scene.add(backLight);
        
        // Grid helper for reference - with brighter colors for better visibility
        const gridHelper = new THREE.GridHelper(10, 10, 0xaaaaaa, 0x666666);
        gridHelper.position.y = -0.01; // Slightly below objects to avoid z-fighting
        scene.add(gridHelper);
        
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
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);
            
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
    }, []);

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
                                
                                // Assign a bright yellow material to make it visible
                                child.material = new THREE.MeshStandardMaterial({ 
                                    color: 0xffff00, // Bright yellow color
                                    metalness: 0.5,
                                    roughness: 0.3,
                                    emissive: 0x333300,
                                    emissiveIntensity: 0.2
                                });
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
            
            dragControls.addEventListener('dragend', () => {
                // Re-enable orbit controls after drag
                if (controlsRef.current) {
                    controlsRef.current.enabled = true;
                }
                
                // Reset dragging state
                isDraggingRef.current = false;
                
                // Reset cursor
                document.body.style.cursor = 'auto';
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
    const captureWorkspaceImage = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
            console.error('Renderer, scene, or camera not initialized');
            return;
        }

        try {
            // Force render to ensure the latest state is captured
            rendererRef.current.render(sceneRef.current, cameraRef.current);
            
            // Get the canvas element
            const canvas = rendererRef.current.domElement;
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `bracelet-design-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        } catch (error) {
            console.error('Error capturing workspace image:', error);
        }
    };    // Effect to handle image capture when isCapturing changes
    useEffect(() => {
        if (isCapturing) {
            captureWorkspaceImage();
        }
    }, [isCapturing]);
    
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
            // Skip built-in scene elements
            if (child.type === 'GridHelper' || 
                child.type === 'DirectionalLight' || 
                child.type === 'AmbientLight' ||
                child instanceof THREE.Camera) {
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
            const x = ((e.clientX - containerRect.left) / containerRect.width) * 10 - 5;
            const y = -((e.clientY - containerRect.top) / containerRect.height) * 10 + 5;
            
            // Generate a unique ID for this specific instance
            const instanceId = `${partData.id}-${Date.now()}`;
            
            // Create a new part with the instance ID
            const newPartInstance = {
                ...partData,
                id: instanceId,
                // Use the calculated drop position
                position: new THREE.Vector3(x, y, 0)
            };
            
            // Load the model
            const modelObject = await loadModel(newPartInstance);
            
            if (modelObject && sceneRef.current) {
                // Add to scene
                sceneRef.current.add(modelObject);
                
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
                backgroundColor: '#1e1e1e',
                borderLeft: '1px solid #333',
                borderRight: '1px solid #333',
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
            
            {/* Drag Mode Toggle Button */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                zIndex: 10
            }}>
                <button 
                    onClick={toggleDragMode}
                    style={{
                        background: dragMode ? '#4CAF50' : 'rgba(85, 85, 85, 0.7)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                    }}
                >
                    <span style={{ fontSize: '16px' }}>
                        {dragMode ? '✓' : '✗'}
                    </span>
                    {dragMode ? 'Drag Mode: ON' : 'Drag Mode: OFF'}
                </button>
            </div>
            
            {/* Instructions Overlay */}
            {renderedObjects.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    zIndex: 10,
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: dragMode ? '5px' : '0' 
                    }}>
                        <span style={{ 
                            fontSize: '14px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: dragMode ? '#4CAF50' : '#555',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {dragMode ? '✓' : '✗'}
                        </span>
                        <span style={{ fontWeight: '500' }}>
                            {dragMode ? 'Drag Mode Active' : 'Drag Mode Inactive'}
                        </span>
                    </div>
                    
                    {dragMode && (
                        <p style={{ 
                            margin: '0', 
                            fontSize: '13px',
                            color: '#aaa'
                        }}>
                            Click and drag objects to reposition
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
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: 'white',
                    padding: '20px 30px',
                    borderRadius: '8px',
                    zIndex: 10,
                    textAlign: 'center',
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    maxWidth: '400px'
                }}>
                    <div style={{ 
                        fontSize: '32px', 
                        marginBottom: '15px',
                        color: '#4CAF50'
                    }}>
                        ↓
                    </div>
                    <h3 style={{
                        margin: '0 0 10px 0',
                        color: '#ffffff',
                        fontWeight: '600',
                        fontSize: '18px'
                    }}>
                        Drag Parts Here
                    </h3>
                    <p style={{ 
                        color: '#aaa',
                        margin: '0'
                    }}>
                        Drag items from the left panel and drop them in this workspace to build your custom bracelet
                    </p>
                </div>
            )}
        </div>
    );
};

export default ThreeJsWorkspace;
