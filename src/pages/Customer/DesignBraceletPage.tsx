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
    // Basic references and state
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    
    // State for parts and objects
    const [objects, setObjects] = useState<THREE.Object3D[]>([]);
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
            modelPath: '/scene.glb'
        }
    ]);
    
    // Basic UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Initialize empty scene for workspace
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x333333); // Dark background
        
        // Create empty container for workspace
        const container = mountRef.current;
        if (!container) return;
        
        // Clean up on component unmount
        return () => {
            // Basic cleanup only for now
            if (rendererRef.current && container) {
                container.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }
        };
    }, []);

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 150px)', overflow: 'hidden', background: '#1e1e1e' }}>
            {/* Sidebar - Preserved */}
            <div
                style={{
                    width: '300px',
                    background: '#2a2a2a',
                    borderRight: '1px solid #444',
                    padding: '10px',
                    overflowY: 'auto',
                }}
            >
                <h3 style={{ color: '#f0f0f0', marginBottom: '15px' }}>Available Parts</h3>
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
                                border: '1px solid #444',
                                borderRadius: '8px',
                                cursor: 'grab',
                                background: '#333',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <PartPreview modelPath={part.modelPath} size={150} />
                            <span style={{ fontWeight: '500', color: '#f0f0f0' }}>{part.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Empty Workspace */}
            <div 
                ref={mountRef}
                style={{ 
                    flex: 1, 
                    position: 'relative',
                    backgroundColor: '#333333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ 
                    color: '#888', 
                    fontSize: '16px', 
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <p>3D Workspace Ready</p>
                    <p>Build your new implementation here</p>
                </div>
            </div>
        </div>
    );
};

export default DesignBraceletPage;