import React, { useState, useEffect } from 'react';
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
            modelPath: '/diamond.glb',
            category: 'bases'
        },
        {
            id: 'charm-cube',
            name: 'Cube Charm',
            modelPath: '/cube.glb',
            category: 'charms'
        },
        {
            id: 'charm-sphere',
            name: 'Sphere Charm',
            modelPath: '/sphere.glb',
            category: 'charms'
        },
        {
            id: 'block-gem',
            name: 'Gem Block',
            modelPath: '/scene.glb',
            category: 'gems'
        }
    ]);    // Basic UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [dragMode, setDragMode] = useState<boolean>(true); // Default to drag mode enabled
    const [rotationMode, setRotationMode] = useState<boolean>(false); // Rotation mode for manual rotation
    const [isCapturing, setIsCapturing] = useState(false); // State for image capture
    const [isAutoRotating, setIsAutoRotating] = useState(false); // Auto-rotation state (disabled by default)

    // Function to save workspace as image
    const saveWorkspaceImage = () => {
        setIsCapturing(true);
        // This will be handled by the ThreeJsWorkspace component
        setTimeout(() => setIsCapturing(false), 1000); // Reset after capture
    };
    
    // Toggle drag mode
    const toggleDragMode = () => {
        setDragMode(prev => !prev);
        // Disable rotation mode when enabling drag mode
        if (!dragMode) {
            setRotationMode(false);
        }
    };

    // Toggle rotation mode
    const toggleRotationMode = () => {
        setRotationMode(prev => !prev);
        // Disable drag mode when enabling rotation mode
        if (!rotationMode) {
            setDragMode(false);
        }
    };

    // Toggle auto-rotation
    const toggleAutoRotation = () => {
        setIsAutoRotating(prev => !prev);
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
    };;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 150px)', overflow: 'hidden', background: '#1e1e1e' }}>
            {/* Sidebar - Parts Selector */}
            <PartLibrary 
                availableParts={availableParts}
                onDragStart={handlePartDragStart}
            />

            {/* Workspace - 3D Canvas */}            <ThreeJsWorkspace
                renderedObjects={renderedObjects}
                setRenderedObjects={setRenderedObjects}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                dragMode={dragMode}
                rotationMode={rotationMode}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                toggleDragMode={toggleDragMode}
                toggleRotationMode={toggleRotationMode}
                isCapturing={isCapturing}
                isAutoRotating={isAutoRotating}
            />
            
            {/* Parts list/controls panel */}            <PartsPanel
                renderedObjects={renderedObjects}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                removeObject={removeObject}
                onSaveImage={saveWorkspaceImage}
                onToggleAutoRotation={toggleAutoRotation}
                isAutoRotating={isAutoRotating}
            />
        </div>
    );
};

export default DesignBraceletPage;
