import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PartLibrary from '../../components/BraceletDesigner/PartLibrary';
import ThreeJsWorkspace from '../../components/BraceletDesigner/ThreeJsWorkspace';
import PartsPanel from '../../components/BraceletDesigner/PartsPanel';
import { BraceletPart, RenderedObject } from '../../components/BraceletDesigner/types';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import OrderService from '../../services/OrderService';

const DesignBraceletPage: React.FC = () => {
    // Navigation
    const navigate = useNavigate();

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
            id: 'heart-gem',
            name: 'Heart Block',
            modelPath: '/heart.glb',
            category: 'gems'
        },
        {
            id: 'star-gem',
            name: 'Star Block',
            modelPath: '/star4.glb',
            category: 'gems'
        },
        {
            id: 'moon-gem',
            name: 'Moon Block',
            modelPath: '/moon.glb',
            category: 'gems'
        }
    ]);

    // Basic UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [dragMode, setDragMode] = useState<boolean>(true); // Default to drag mode enabled
    const [rotationMode, setRotationMode] = useState<boolean>(false); // Rotation mode for manual rotation
    const [isCapturing, setIsCapturing] = useState(false); // State for image capture
    const [isAutoRotating, setIsAutoRotating] = useState(false); // Auto-rotation state (disabled by default)

    // State for captured image
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const captureResolver = useRef<((f: File) => void) | null>(null);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    // Function to save workspace as image
    const saveWorkspaceImage = () => {
        setIsCapturing(true);
        // This will be handled by the ThreeJsWorkspace component
        setTimeout(() => setIsCapturing(false), 1000); // Reset after capture
    };

    // Handle captured image from workspace

    const handleImageCaptured = (file: File) => {
        setCapturedFile(file);
        if (captureResolver.current) {
            captureResolver.current(file);
            captureResolver.current = null;
        }
    };

    const triggerCapture = (): Promise<File> => {
        return new Promise<File>((resolve, reject) => {
            captureResolver.current = resolve;
            setIsCapturing(true);
            // safety timeout
            setTimeout(() => {
                if (captureResolver.current) {
                    captureResolver.current = null;
                    setIsCapturing(false);
                    reject(new Error("Capture timeout"));
                }
            }, 5000);
        }).finally(() => setIsCapturing(false));
    };

    // Function to add custom bracelet to cart
    const addToCartProduct = async () => {
        try {
            setIsProcessingOrder(true);

            if (renderedObjects.length === 0) {
                alert("Please add some parts before adding to cart");
                return;
            }

            // Check if user is authenticated
            const accountStr = localStorage.getItem('account');
            const accountId = accountStr ? JSON.parse(accountStr).id : null;
            if (!accountId) {
                alert("You need to login before adding to cart");
                navigate('/login', { state: { from: '/design' } });
                return;
            }

            let file = capturedFile;
            if (!file) {
                try {
                    file = await triggerCapture();
                } catch (err) {
                    console.error(err);
                    alert("Failed to capture preview");
                    return;
                }
            }

            const customBraceletCategory = await CategoryService.getByName("Custom Bracelets");
            if (!customBraceletCategory) {
                throw new Error("Custom Bracelets category not found");
            }

            const payload = {
                categoryIds: [String(customBraceletCategory.categoryId)] as string[],
                productName: "Custom Bracelet",
                productDescription: renderedObjects.map((o) => o.partData.name).join(", ") || "Custom designed bracelet",
                productMaterial: "custom",
                quantity: renderedObjects.length,
                type: "custom",
                price: renderedObjects.length * 50_000,
                status: 2,
                image: file,
            } as const;


            try {
                const newProduct = await ProductService.create(payload);
                if (!newProduct?.productId) throw new Error("Invalid productId in response");

                const order = await OrderService.addToCart(accountId, String(newProduct.productId));
                const itemCount = order.orderDetails.filter((d) => d.status !== 0).length;
                localStorage.setItem("amount", String(itemCount));

                // 5. Show success message
                alert("Custom bracelet added to cart successfully!");

                // 6. Navigate to cart page
                navigate("/cart");

            } catch (error) {
                console.error("Error creating product or adding to cart:", error);
                setError("Failed to add bracelet to cart. Please try again.");
                alert("Failed to add bracelet to cart. Please try again.");
            }
        } catch (err: any) {
            console.error("Error creating order:", err);
        } finally {
            setIsProcessingOrder(false);
            setIsCapturing(false);
        }
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
    };

    // Remove object from the scene
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
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 150px)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
            position: 'relative'
        }}>
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
                rotationMode={rotationMode}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                toggleDragMode={toggleDragMode}
                toggleRotationMode={toggleRotationMode}
                isCapturing={isCapturing}
                isAutoRotating={isAutoRotating}
                onImageCaptured={handleImageCaptured}
            />

            {/* Parts list/controls panel */}
            <PartsPanel
                renderedObjects={renderedObjects}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
                removeObject={removeObject}
                onSaveImage={saveWorkspaceImage}
                onToggleAutoRotation={toggleAutoRotation}
                isAutoRotating={isAutoRotating}
                onOrder={addToCartProduct}
                isProcessingOrder={isProcessingOrder}
            />
        </div>
    );
};

export default DesignBraceletPage;
