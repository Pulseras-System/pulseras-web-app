import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { debounce } from 'lodash';
import PartPreview from '../../components/PartPreview';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

interface BraceletPart {
    id: string;
    name: string;
    modelPath: string;
    thumbnail?: string;
    position?: THREE.Vector3;
    scale?: THREE.Vector3;
    rotation?: THREE.Euler;
    category?: string;
}

interface RenderedObject {
    id: string;
    object: THREE.Object3D;
    partData: BraceletPart;
}

const DesignBraceletPage: React.FC = () => {
    // Add CSS animation for the loading spinner
    React.useEffect(() => {
        // Add the spin animation style to the document
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleEl);
        
        // Clean up on unmount
        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);

    // Basic references and state
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationRef = useRef<number | null>(null);
    const dragControlsRef = useRef<DragControls | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    
    // State for parts and objects
    const [renderedObjects, setRenderedObjects] = useState<RenderedObject[]>([]);
    const [availableParts] = useState<BraceletPart[]>([
        {
            id: 'base-bracelet',
            name: 'Base Bracelet',
            modelPath: '/models/base-bracelet.glb',
            category: 'bases'
        },
        {
            id: 'charm-heart',
            name: 'Heart Charm',
            modelPath: '/models/heart-charm.glb',
            category: 'charms'
        },
        {
            id: 'charm-star',
            name: 'Star Charm',
            modelPath: '/models/star-charm.glb',
            category: 'charms'
        },
        {
            id: 'block-gem',
            name: 'Gem Block',
            modelPath: '/scene.glb',
            category: 'gems'
        }
    ]);
    
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Get unique categories
    const categories = Array.from(
        new Set(
            availableParts
                .map(part => part.category)
                .filter((category): category is string => category !== undefined)
        )
    );
    
    // Get parts filtered by category and search query
    const filteredParts = availableParts.filter(part => {
        const matchesCategory = selectedCategory ? part.category === selectedCategory : true;
        const matchesSearch = searchQuery 
            ? part.name.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesCategory && matchesSearch;
    });
    
    // Basic UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [dragMode, setDragMode] = useState<boolean>(true); // Default to drag mode enabled
    
    // Initialize Three.js scene
    useEffect(() => {        // Initialize scene
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
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased directional light intensity
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
    
    // Toggle drag mode
    const toggleDragMode = () => {
        setDragMode(prev => {
            const newMode = !prev;
            
            // Update drag controls if they exist
            if (dragControlsRef.current) {
                dragControlsRef.current.enabled = newMode;
            }
            
            return newMode;
        });
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

    // Remove object from the scene
    const removeObject = (id: string) => {
        setRenderedObjects(prev => {
            const objectToRemove = prev.find(obj => obj.id === id);
            
            if (objectToRemove && sceneRef.current) {
                sceneRef.current.remove(objectToRemove.object);
            }
            
            return prev.filter(obj => obj.id !== id);
        });
        
        if (selectedObject === id) {
            setSelectedObject(null);
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 150px)', overflow: 'hidden', background: '#1e1e1e' }}>
            {/* Sidebar - Parts Selector */}
            <div
                style={{
                    width: '300px',
                    background: '#1e1e1e',
                    borderRight: '1px solid #333',
                    padding: '0',
                    overflowY: 'auto',
                }}
            >
                <div style={{ 
                    padding: '20px', 
                    borderBottom: '1px solid #333', 
                    background: 'linear-gradient(to right, #2a2a2a, #222222)'
                }}>
                    <h3 style={{ 
                        color: '#ffffff', 
                        marginBottom: '5px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        Bracelet Parts Library
                    </h3>
                    <p style={{ 
                        color: '#888', 
                        fontSize: '14px'
                    }}>
                        Drag parts to the workspace
                    </p>
                </div>
                
                {/* Search Bar */}
                <div style={{ 
                    padding: '15px',
                    borderBottom: '1px solid #333',
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div style={{ 
                        flex: 1, 
                        position: 'relative' 
                    }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search parts..."
                            style={{
                                width: '100%',
                                padding: '10px 40px 10px 15px',
                                border: '1px solid #444',
                                borderRadius: '6px',
                                background: '#333',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.border = '1px solid #4CAF50';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1px solid #444';
                            }}
                        />
                        <span style={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '10px', 
                            transform: 'translateY(-50%)',
                            color: '#888',
                            fontSize: '14px'
                        }}>
                            🔍
                        </span>
                    </div>
                </div>                <div style={{ padding: '15px' }}>                    {/* Category Tabs */}
                    <div style={{ 
                        display: 'flex', 
                        backgroundColor: '#2a2a2a', 
                        borderRadius: '6px',
                        marginBottom: '15px',
                        overflow: 'hidden'
                    }}>
                        <button 
                            style={{ 
                                flex: 1, 
                                padding: '10px', 
                                border: 'none', 
                                background: selectedCategory === null ? '#4CAF50' : '#333', 
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: selectedCategory === null ? 'bold' : 'normal',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All Parts
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                style={{ 
                                    flex: 1, 
                                    padding: '10px', 
                                    border: 'none', 
                                    background: selectedCategory === category ? '#4CAF50' : '#333', 
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: selectedCategory === category ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)} {/* Capitalize first letter */}
                            </button>
                        ))}
                    </div>
                    
                    {/* Results count */}
                    {(searchQuery || selectedCategory) && (
                        <div style={{ 
                            marginBottom: '15px', 
                            fontSize: '14px',
                            color: '#888',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span>
                                Showing {filteredParts.length} {filteredParts.length === 1 ? 'result' : 'results'}
                            </span>
                            {(searchQuery || selectedCategory) && (
                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#4CAF50',
                                        cursor: 'pointer',
                                        padding: '0',
                                        fontSize: '14px',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {filteredParts.length > 0 ? (
                            filteredParts.map((part) => (
                                <div
                                    key={part.id}
                                    draggable
                                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                                        e.dataTransfer.setData('application/json', JSON.stringify(part));
                                        document.body.style.cursor = 'grabbing';
                                    }}
                                    onDragEnd={() => {
                                        document.body.style.cursor = 'default';
                                    }}
                                    style={{
                                        borderRadius: '8px',
                                        cursor: 'grab',
                                        background: '#2a2a2a',
                                        overflow: 'hidden',
                                        border: '1px solid #444',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOver={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseOut={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                    }}
                                >                                    <div style={{ 
                                        background: '#333', 
                                        padding: '10px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        height: '140px',
                                        overflow: 'hidden'
                                    }}>
                                        <PartPreview modelPath={part.modelPath} size={120} />
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: '#f0f0f0',
                                            fontSize: '16px',
                                            marginBottom: '5px'
                                        }}>
                                            {part.name}
                                        </div>
                                        <div style={{ 
                                            color: '#888', 
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            <span style={{ 
                                                display: 'inline-block',
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: '#4CAF50',
                                                borderRadius: '50%',
                                                marginRight: '5px'
                                            }}></span>
                                            Drag to add to your design                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: '30px 20px',
                                background: '#2a2a2a',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '1px dashed #444'
                            }}>
                                <div style={{ 
                                    fontSize: '24px', 
                                    marginBottom: '10px',
                                    color: '#666'
                                }}>
                                    😕
                                </div>
                                <div style={{ 
                                    color: '#f0f0f0', 
                                    fontWeight: '500', 
                                    marginBottom: '5px' 
                                }}>
                                    No parts found
                                </div>
                                <div style={{ color: '#888', fontSize: '14px' }}>
                                    Try changing your search or filters
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Workspace - 3D Canvas */}
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
            
            {/* Parts list/controls panel */}
            <div style={{
                width: '280px',
                background: '#1e1e1e',
                borderLeft: '1px solid #333',
                overflowY: 'auto',
            }}>
                <div style={{ 
                    padding: '20px', 
                    borderBottom: '1px solid #333', 
                    background: 'linear-gradient(to right, #222222, #2a2a2a)'
                }}>
                    <h3 style={{ 
                        color: '#ffffff', 
                        marginBottom: '5px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        Bracelet Parts
                    </h3>
                    <p style={{ 
                        color: '#888', 
                        fontSize: '14px'
                    }}>
                        {renderedObjects.length} {renderedObjects.length === 1 ? 'part' : 'parts'} in your design
                    </p>
                </div>
                
                <div style={{ padding: '15px' }}>
                    {renderedObjects.length === 0 ? (
                        <div style={{ 
                            color: '#888', 
                            padding: '20px', 
                            textAlign: 'center',
                            background: '#2a2a2a',
                            borderRadius: '8px',
                            border: '1px dashed #444'
                        }}>
                            <div style={{ 
                                fontSize: '24px', 
                                marginBottom: '10px',
                                color: '#666'
                            }}>
                                ✨
                            </div>
                            Drag parts from the left panel to begin creating your custom bracelet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {renderedObjects.map((obj) => (
                                <div 
                                    key={obj.id}
                                    style={{
                                        background: selectedObject === obj.id 
                                            ? 'linear-gradient(to right, #3a3a3a, #444)' 
                                            : '#2a2a2a',
                                        borderRadius: '8px',
                                        border: selectedObject === obj.id 
                                            ? '1px solid #555' 
                                            : '1px solid #333',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onClick={() => setSelectedObject(obj.id)}
                                >
                                    <div style={{
                                        padding: '12px 15px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        borderLeft: selectedObject === obj.id 
                                            ? '3px solid #4CAF50' 
                                            : '3px solid transparent'
                                    }}>
                                        <div>
                                            <div style={{ 
                                                color: selectedObject === obj.id ? '#ffffff' : '#f0f0f0', 
                                                fontWeight: '500',
                                                fontSize: '15px'
                                            }}>
                                                {obj.partData.name}
                                            </div>
                                            <div style={{ 
                                                color: '#888', 
                                                fontSize: '12px', 
                                                marginTop: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <span style={{ fontSize: '10px' }}>⟐</span>
                                                {obj.object.position.x.toFixed(1)}, {obj.object.position.y.toFixed(1)}, {obj.object.position.z.toFixed(1)}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeObject(obj.id);
                                            }}
                                            style={{
                                                background: selectedObject === obj.id ? '#555' : '#333',
                                                border: 'none',
                                                color: '#fff',
                                                borderRadius: '50%',
                                                width: '26px',
                                                height: '26px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontSize: '18px'
                                            }}
                                            onMouseOver={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = '#ff4444';
                                            }}
                                            onMouseOut={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = selectedObject === obj.id ? '#555' : '#333';
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Selected object controls */}
                    {selectedObject && (
                        <div style={{ 
                            marginTop: '20px', 
                            padding: '15px', 
                            background: '#2a2a2a', 
                            borderRadius: '8px',
                            border: '1px solid #444',
                        }}>
                            <h4 style={{ 
                                color: '#ffffff', 
                                marginBottom: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#4CAF50',
                                    fontSize: '14px'
                                }}>✎</span>
                                Edit Selected Part
                            </h4>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ 
                                    color: '#aaa', 
                                    fontSize: '14px', 
                                    marginBottom: '8px',
                                    fontWeight: '500'
                                }}>
                                    Position Controls
                                </div>
                                <div style={{ 
                                    fontSize: '13px', 
                                    color: '#888',
                                    padding: '8px',
                                    background: '#333',
                                    borderRadius: '6px',
                                }}>
                                    {dragMode ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#4CAF50', fontSize: '16px' }}>✓</span>
                                            Drag mode is active! Click and drag the part in the workspace.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#ff4444', fontSize: '16px' }}>✗</span>
                                            Drag mode is disabled. Enable it to reposition.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={toggleDragMode}
                                style={{
                                    background: dragMode ? '#4CAF50' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontWeight: '500',
                                    transition: 'background 0.2s ease'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>
                                    {dragMode ? '✓' : '✗'}
                                </span>
                                {dragMode ? 'Drag Mode: ON' : 'Drag Mode: OFF'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignBraceletPage;