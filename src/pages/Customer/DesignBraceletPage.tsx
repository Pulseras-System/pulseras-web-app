import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import PartLibrary from '../../components/BraceletDesigner/PartLibrary';
import ThreeJsWorkspace from '../../components/BraceletDesigner/ThreeJsWorkspace';
import PartsPanel from '../../components/BraceletDesigner/PartsPanel';
import { BraceletPart, RenderedObject } from '../../components/BraceletDesigner/types';

const DesignBraceletPage: React.FC = () => {
    // Add CSS animation for the loading spinner
    useEffect(() => {
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

    // Basic UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [dragMode, setDragMode] = useState<boolean>(true); // Default to drag mode enabled
    
    // Toggle drag mode
    const toggleDragMode = () => {
        setDragMode(prev => !prev);
    };

    // Handle part drag start
    const handlePartDragStart = (e: React.DragEvent<HTMLDivElement>, part: BraceletPart) => {
        e.dataTransfer.setData('application/json', JSON.stringify(part));
        document.body.style.cursor = 'grabbing';
    };    // Remove object from the scene
    const removeObject = (id: string) => {
        setRenderedObjects(prev => {
            // Filter out the object with the matching id
            return prev.filter(obj => obj.id !== id);
        });
        
        // If we're removing the currently selected object, deselect it
        if (selectedObject === id) {
            setSelectedObject(null);
        }
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 150px)', overflow: 'hidden', background: '#1e1e1e' }}>
            {/* Sidebar - Parts Selector */}
            <PartLibrary 
                availableParts={availableParts}
                onDragStart={handlePartDragStart}
            />

            {/* Workspace - 3D Canvas */}
            <ThreeJsWorkspace
                renderedObjects={renderedObjects}
                setRenderedObjects={setRenderedObjects}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                dragMode={dragMode}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                toggleDragMode={toggleDragMode}
            />
            
            {/* Parts list/controls panel */}
            <PartsPanel
                renderedObjects={renderedObjects}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                removeObject={removeObject}
            />
        </div>
    );
};

export default DesignBraceletPage;
