import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PartLibrary from '../../components/BraceletDesigner/PartLibrary';
import ThreeJsWorkspace from '../../components/BraceletDesigner/ThreeJsWorkspace';
import PartsPanel from '../../components/BraceletDesigner/PartsPanel';
import { BraceletPart, RenderedObject } from '../../components/BraceletDesigner/types';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import OrderService from '../../services/OrderService';
import OrderDetailService from '../../services/OrderDetailService';

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
    const [rotationMode, setRotationMode] = useState<boolean>(false); // Rotation mode for manual rotation
    const [isCapturing, setIsCapturing] = useState(false); // State for image capture
    const [isAutoRotating, setIsAutoRotating] = useState(false); // Auto-rotation state (disabled by default)

    // State for captured image
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);

    // Function to save workspace as image
    const saveWorkspaceImage = () => {
        setIsCapturing(true);
        // This will be handled by the ThreeJsWorkspace component
        setTimeout(() => setIsCapturing(false), 1000); // Reset after capture
    };

    // Handle captured image from workspace
    const handleImageCaptured = (imageData: string) => {
        console.log("Image captured successfully, length:", imageData.length);

        // Verify image was captured successfully
        if (imageData && imageData.startsWith('data:image')) {
            console.log("Image format is valid, prefix:", imageData.substring(0, 30));
            setCapturedImage(imageData);
        } else {
            console.error("Invalid image data format:",
                imageData ? `Starts with: ${imageData.substring(0, 30)}...` : "null or empty");
            setError("Failed to capture workspace image");
        }
    };

    // Function to add custom bracelet to cart
    const addToCartProduct = async () => {
        try {
            setIsProcessingOrder(true);

            // Check if there are any parts in the design
            if (renderedObjects.length === 0) {
                setError("Please add some parts to your bracelet design before adding to cart");
                alert("Please add some parts to your bracelet design before adding to cart");
                return;
            }

            // Check if user is authenticated
            const accountStr = localStorage.getItem('account');
            const accountId = accountStr ? JSON.parse(accountStr).id : null;
            if (!accountId) {
                setError("Please login before adding to cart");
                alert("You need to login before adding to cart");
                navigate('/login', { state: { from: '/design' } });
                return;
            }

            // First capture the image if not already captured
            // Use a local variable to store the captured image data to avoid React state timing issues
            let capturedImageLocal = capturedImage;

            if (!capturedImageLocal) {
                console.log("No captured image yet, initiating capture process");

                try {
                    // Create a promise that will resolve when the image is captured
                    const capturePromise = new Promise<string>((resolve, reject) => {
                        // Store the current handler
                        const originalHandler = handleImageCaptured;

                        // Override the handler temporarily to capture the image
                        const captureHandler = (imageData: string) => {
                            console.log("Image captured in promise handler, length:", imageData.length);
                            // Call the original handler
                            originalHandler(imageData);
                            // Resolve the promise with the image data
                            resolve(imageData);
                        };

                        // Replace the handler
                        const tempHandler = (imageData: string) => captureHandler(imageData);

                        // Set the onImageCaptured prop for ThreeJsWorkspace
                        (window as any).tempImageCaptureCallback = tempHandler;

                        // Set capturing flag to trigger the image capture
                        setIsCapturing(true);

                        // Set a timeout in case the capture doesn't happen
                        setTimeout(() => {
                            reject(new Error("Capture timeout"));
                            delete (window as any).tempImageCaptureCallback;
                        }, 5000);
                    });

                    // Wait for the capture to complete or timeout
                    console.log("Waiting for image capture to complete...");
                    const imageData = await capturePromise;
                    console.log("Capture promise resolved with image data:",
                        imageData ? `${imageData.substring(0, 30)}... (length: ${imageData.length})` : "null");

                    // Store in both state and local variable
                    setCapturedImage(imageData);
                    capturedImageLocal = imageData;

                    setIsCapturing(false); // Make sure to reset capturing flag
                } catch (captureError) {
                    console.error("Image capture failed:", captureError);

                    // Try direct access to the ThreeJS renderer if available
                    try {
                        console.log("Trying direct renderer access as fallback...");
                        // Find the canvas element
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            const directImageData = canvas.toDataURL('image/png');
                            console.log("Direct canvas capture succeeded, length:", directImageData.length);
                            setCapturedImage(directImageData);
                            capturedImageLocal = directImageData;
                        } else {
                            throw new Error("Canvas not found");
                        }
                    } catch (fallbackError) {
                        console.error("Direct canvas access failed:", fallbackError);

                        // Use a larger, more visible placeholder image rather than tiny red dot
                        const placeholderImage = "data:image/png;base64,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";
                        console.log("Using larger placeholder image as backup");
                        setCapturedImage(placeholderImage);
                        capturedImageLocal = placeholderImage;
                    }
                } finally {
                    // Clean up the temporary handler
                    delete (window as any).tempImageCaptureCallback;
                    setIsCapturing(false);
                }
            }

            // Get all categories to find the Custom Bracelets category
            const customBraceletCategory = await CategoryService.getByName("Custom Bracelets");
            // const customBraceletCategory = categories.find(
            //     cat => cat.categoryName === "Custom Bracelets"
            // );
            if (!customBraceletCategory) {
                throw new Error("Custom Bracelets category not found");
            }

            // Create description from all parts
            const partsDescription = renderedObjects.map(obj => {
                return obj.partData.name;
            }).join(", ");

            // Ensure we have an image, even if capture failed
            const finalImageData = capturedImageLocal || capturedImage ||
                "data:image/png;base64,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";

            console.log("Using image for product, length:", finalImageData ? finalImageData.length : "null");

            // Create product data
            const productData = {
                categoryIds: [customBraceletCategory.categoryId.toString()],
                productName: "Custom Bracelet",
                productDescription: partsDescription || "Custom designed bracelet",
                productMaterial: "custom",
                productImage: finalImageData,
                quantity: renderedObjects.length,
                type: "custom",
                price: renderedObjects.length * 50000, // 50,000 per part
                status: 2 // As specified in the requirements
            };

            console.log("Creating product with data:", JSON.stringify({
                ...productData,
                productImage: `${productData.productImage.substring(0, 30)}... [truncated]`
            }));

            try {
                // Create the product using ProductService
                console.log("Creating product using ProductService.create");

                const newProduct = await ProductService.create(productData);
                console.log("Product created successfully:", newProduct);

                // Extract productId directly from response
                let productId: string;
                if (newProduct && newProduct.productId) {
                    productId = String(newProduct.productId);
                    console.log("Using product ID from response:", productId);
                } else {
                    throw new Error("Created product doesn't have a valid productId");
                }

                // Now add to cart using the same logic as AddToCartButton
                // 1. Get or create cart order (status = 1)
                const orders = await OrderService.getByAccountId(accountId);
                let cartOrder = Array.isArray(orders) ? orders.find((o: any) => o.status === 1) : null;
                
                // 2. If no cart order exists, create one
                if (!cartOrder) {
                    const now = new Date().toISOString();
                    const newOrder = await OrderService.create({
                        orderInfor: 'Giỏ hàng',
                        amount: 0,
                        accountId: accountId,
                        voucherId: "0",
                        totalPrice: 0,
                        status: 1,
                        lastEdited: now,
                        createDate: now
                    });
                    cartOrder = newOrder;
                }

                // 3. Add product to cart via OrderDetail
                const existedOrderDetails = await (await OrderDetailService.getByOrderId(String(cartOrder.id)))
                    .find((od: any) => od.productId === productId);
                    
                if (existedOrderDetails && existedOrderDetails.status === 1) {
                    // If item already exists, update quantity
                    await OrderDetailService.update(
                        existedOrderDetails.id,
                        {
                            orderId: String(cartOrder.id),
                            productId: String(productId),
                            quantity: existedOrderDetails.quantity + 1,
                            price: productData.price,
                            promotionId: "0",
                            status: 1,
                            lastEdited: new Date().toISOString()
                        }
                    );
                } else if (existedOrderDetails && existedOrderDetails.status === 0) {
                    // If item exists but was deleted, reactivate it
                    await OrderDetailService.update(
                        existedOrderDetails.id,
                        {
                            orderId: String(cartOrder.id),
                            productId: String(productId),
                            quantity: 1,
                            price: productData.price,
                            promotionId: "0",
                            status: 1,
                            lastEdited: new Date().toISOString()
                        }
                    );
                } else {
                    // If item doesn't exist, create new OrderDetail
                    await OrderDetailService.create({
                        orderId: String(cartOrder.id),
                        productId: String(productId),
                        quantity: 1,
                        price: productData.price,
                        promotionId: "0",
                        status: 1,
                        lastEdited: new Date().toISOString(),
                        createDate: new Date().toISOString()
                    });
                }

                // 4. Update cart count in localStorage for header icon
                localStorage.setItem('amount', (Number(localStorage.getItem('amount')) + 1).toString());

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
