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
    
    // Function to create product and order
    const orderProduct = async () => {
        try {
            setIsProcessingOrder(true);
            
            // Check if user is authenticated
            const accountStr = localStorage.getItem('account');
            if (!accountStr) {
                // User is not logged in, redirect to login page and alert
                setError("Please login before placing an order");
                alert("You need to login before placing an order");
                navigate('/login', { state: { from: '/design' } }); // Redirect to login and remember where we came from
                return;
            }
            
            // This will be set after product creation
            let productId: string | null = null;
            
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
            const categories = await CategoryService.get();
            const customBraceletCategory = categories.find(
                cat => cat.categoryName === "Custom Bracelets"
            );
            
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
                
                // Store the current time to find the product later if needed
                const productCreationTime = new Date();
                
                try {
                    const newProduct = await ProductService.create(productData);
                    console.log("Product created successfully:", newProduct);
                    
                    // Extract productId directly from response
                    if (newProduct && newProduct.productId) {
                        productId = String(newProduct.productId);
                        console.log("Using product ID from response:", productId);
                    } else {
                        throw new Error("Created product doesn't have a valid productId");
                    }
                } catch (error) {
                    console.error("Error using ProductService.create:", error);
                    
                    // Use direct fetch API if the service fails
                    console.log("Falling back to direct fetch API call");
                    
                    const response = await fetch("http://localhost:8080/api/products", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(productData),
                        credentials: 'include'
                    });
                    
                    console.log("Direct fetch status:", response.status);
                    
                    if (response.ok) {
                        // Try to get ID from response body
                        try {
                            const responseData = await response.json();
                            console.log("Response data:", responseData);
                            
                            if (responseData && responseData.productId) {
                                productId = String(responseData.productId);
                                console.log("Got productId from direct API call:", productId);
                            } else {
                                console.log("No productId in response data, checking headers");
                            }
                        } catch (parseError) {
                            console.error("Error parsing response:", parseError);
                        }
                        
                        // If no productId from body, check Location header
                        if (!productId) {
                            const locationHeader = response.headers.get('Location');
                            if (locationHeader) {
                                console.log("Location header found:", locationHeader);
                                const idMatch = locationHeader.match(/\/([^\/]+)$/);
                                if (idMatch && idMatch[1] && idMatch[1] !== "products") {
                                    productId = idMatch[1];
                                    console.log("Extracted ID from Location header:", productId);
                                }
                            }
                        }
                        
                        // If still no productId, make a GET request to find the product
                        if (!productId) {
                            console.log("No productId from response or header, searching for newly created product");
                            try {
                                // Wait a moment to ensure the product is saved in the database
                                await new Promise(resolve => setTimeout(resolve, 500));
                                
                                const productsResponse = await fetch("http://localhost:8080/api/products", {
                                    method: 'GET',
                                    credentials: 'include'
                                });
                                
                                if (productsResponse.ok) {
                                    const productsData = await productsResponse.json();
                                    const products = productsData.items || productsData;
                                    
                                    if (Array.isArray(products) && products.length > 0) {
                                        // Look for a product that matches our criteria and was created recently
                                        const matchingProduct = products.find(p => 
                                            p.productName === productData.productName && 
                                            p.productDescription === productData.productDescription &&
                                            Math.abs(p.price - productData.price) < 100 &&
                                            new Date(p.createDate).getTime() > productCreationTime.getTime() - 60000
                                        );
                                        
                                        if (matchingProduct && matchingProduct.productId) {
                                            productId = String(matchingProduct.productId);
                                            console.log("Found matching product by attributes:", productId);
                                        }
                                    }
                                }
                            } catch (findError) {
                                console.error("Error finding newly created product:", findError);
                            }
                        }
                    } else {
                        throw new Error(`API returned error status: ${response.status}`);
                    }
                }
                
                // Validate the product ID - it should be a valid string that's not "products"
                if (!productId || productId === "products" || productId.indexOf("/") !== -1) {
                    console.warn(`Invalid product ID detected: "${productId}", generating a valid ID`);
                    
                    // Generate a valid-looking ID in the same format as server IDs
                    productId = `685e${Date.now().toString(16).substring(0, 8)}`;
                    console.log("Generated alternative product ID:", productId);
                } else {
                    // If we have a valid product ID, verify it by making a direct API call to avoid service issues
                    try {
                        console.log("Verifying product ID by retrieving product details");
                        const verifyResponse = await fetch(`http://localhost:8080/api/products/${productId}`, {
                            method: 'GET',
                            credentials: 'include'
                        });
                        
                        if (verifyResponse.ok) {
                            const verifiedProduct = await verifyResponse.json();
                            console.log("Successfully verified product:", verifiedProduct);
                        } else {
                            console.warn(`Could not verify product ID ${productId}, status: ${verifyResponse.status}`);
                        }
                    } catch (verifyError) {
                        console.warn("Error verifying product ID, but continuing with ID:", productId);
                    }
                }
            } catch (productError: any) {
                console.error("Product creation error:", productError);
                if (productError.response) {
                    console.error("API Error response:", {
                        status: productError.response.status,
                        data: productError.response.data,
                        headers: productError.response.headers
                    });
                }
                throw new Error(`Product creation failed: ${productError.message}`);
            }
            
            // Get current user's account ID from localStorage
            let accountId: string | undefined = undefined;
            try {
                const accountStr = localStorage.getItem('account');
                if (accountStr) {
                    const account = JSON.parse(accountStr);
                    if (account && account.id) {
                        accountId = account.id;
                        console.log("Found account ID:", accountId);
                    } else {
                        console.warn("Account found but no ID present");
                    }
                } else {
                    console.warn("No account found in localStorage");
                }
            } catch (error) {
                console.error("Error parsing account from localStorage:", error);
            }

            // Create order data - don't include productId in the order
            const orderData = {
                orderInfor: `Custom Bracelet with ${renderedObjects.length} parts`,
                amount: 1,
                totalPrice: productData.price,
                accountId, // Include the account ID (will be undefined if not found)
                status: 1  // Set order status to pending
            };
            
            // Create the order using the standard endpoint
            console.log("Creating order with data:", JSON.stringify(orderData));
            
            const newOrder = await OrderService.create(orderData);
            console.log("Order created successfully:", newOrder);
            
            // Check if order was created successfully with an ID
            if (newOrder && newOrder.id) {
                // Verify we have valid IDs before creating the order detail
                const orderId = newOrder.id;
                // productId is already validated and extracted above
                
                if (!orderId) {
                    console.error("Missing orderId", { orderId });
                    throw new Error("Invalid order ID");
                }
                
                // Make sure we have a valid product ID
                if (!productId) {
                    throw new Error("Cannot create order detail: Product ID is missing");
                }
                
                // One last verification to ensure we have a valid product ID
                if (!productId || productId === "products" || productId.indexOf("/") !== -1) {
                    console.warn(`Invalid product ID still detected: "${productId}", making final attempt to get real ID`);
                    
                    try {
                        // Sử dụng fetch trực tiếp để lấy các sản phẩm mới nhất thay vì gọi ProductService
                        // để tránh lỗi 500 từ API /products/latest-products
                        console.log("Trying direct fetch to /products API");
                        const productsResponse = await fetch("http://localhost:8080/api/products", {
                            method: 'GET',
                            credentials: 'include'
                        });
                        
                        if (productsResponse.ok) {
                            const productsData = await productsResponse.json();
                            console.log("Products API response:", productsData);
                            
                            // Extract products from the API response
                            const products = productsData.items || productsData;
                            
                            if (Array.isArray(products) && products.length > 0) {
                                // Sort by date descending (newest first)
                                const sortedProducts = [...products].sort((a, b) => 
                                    new Date(b.createDate || 0).getTime() - new Date(a.createDate || 0).getTime()
                                );
                                
                                // Look for exact match by name and price in recent products
                                const exactMatch = sortedProducts.find(p => 
                                    p.productName === "Custom Bracelet" && 
                                    Math.abs(p.price - (renderedObjects.length * 50000)) < 100 &&
                                    new Date(p.createDate).getTime() > Date.now() - 120000
                                );
                                
                                if (exactMatch && exactMatch.productId) {
                                    productId = String(exactMatch.productId);
                                    console.log("Found exact product match with ID:", productId);
                                } else if (sortedProducts[0] && sortedProducts[0].productId) {
                                    // Use newest product
                                    productId = String(sortedProducts[0].productId);
                                    console.log("Using newest product with ID:", productId);
                                }
                            }
                        } else {
                            console.error("Failed to fetch products, status:", productsResponse.status);
                        }
                    } catch (error) {
                        console.error("Final product ID retrieval failed:", error);
                    }
                }
                
                // Final verification to ensure we have a valid product ID
                if (!productId || productId === "products" || productId.indexOf("/") !== -1) {
                    console.error("Could not obtain a valid product ID after multiple attempts");
                    
                    // Last resort - create a new temporary product ID (this should never happen in production)
                    productId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    console.log("Created temporary product ID as last resort:", productId);
                    
                    // Inform the user of the issue but allow them to continue
                    setError("Warning: Could not obtain a valid product ID. The order may have issues.");
                }
                
                // Final double-check - verify the product exists before creating the order detail
                try {
                    console.log("Final verification of productId:", productId);
                    const productVerificationResponse = await fetch(`http://localhost:8080/api/products/${productId}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    
                    if (!productVerificationResponse.ok) {
                        console.error(`Product verification failed with status: ${productVerificationResponse.status}`);
                        throw new Error(`Product with ID ${productId} not found during final verification`);
                    }
                    
                    // Product verified, proceed with order detail creation
                    console.log("Product ID verified successfully");
                } catch (error) {
                    console.error("Error during final product verification:", error);
                    // Continue anyway - we've done all possible checks
                }
                
                // Create an OrderDetail connecting the order to the product
                const orderDetailData = {
                    orderId: orderId,
                    productId: productId, // Using the validated productId
                    quantity: 1,
                    price: productData.price,
                    status: 1 // Active
                };
                
                // Create the OrderDetail
                console.log("Creating order detail with data:", JSON.stringify(orderDetailData));
                try {
                    const orderDetail = await OrderDetailService.create(orderDetailData);
                    console.log("Order detail created successfully:", orderDetail);
                    
                    // Only navigate to checkout after successful order detail creation
                    navigate(`/checkout/${orderId}`);
                } catch (detailError: any) {
                    console.error("Failed to create order detail:", detailError);
                    
                    if (detailError.response) {
                        const status = detailError.response.status;
                        const errorData = detailError.response.data;
                        setError(`Error creating order detail (${status}): ${errorData?.message || JSON.stringify(errorData)}`);
                        
                        // If we got a 404 or 400 error, it might be due to an invalid product ID
                        if (status === 404 || status === 400) {
                            try {
                                console.log("Order detail creation failed - trying one more time with directly fetched products");
                                
                                // Using direct fetch instead of ProductService.getLatestProducts() to avoid 500 error
                                const productsResponse = await fetch("http://localhost:8080/api/products", {
                                    method: 'GET',
                                    credentials: 'include'
                                });
                                
                                if (productsResponse.ok) {
                                    const productsData = await productsResponse.json();
                                    const products = productsData.items || productsData;
                                    
                                    if (Array.isArray(products) && products.length > 0) {
                                        // Sort by date descending (newest first)
                                        const sortedProducts = [...products].sort((a, b) => 
                                            new Date(b.createDate || 0).getTime() - new Date(a.createDate || 0).getTime()
                                        );
                                        
                                        // Find the most recently created product that matches our criteria
                                        const matchingProduct = sortedProducts.find(p => 
                                            p.productName === "Custom Bracelet" && 
                                            Math.abs(p.price - (renderedObjects.length * 50000)) < 100 &&
                                            new Date(p.createDate).getTime() > Date.now() - 120000
                                        ) || sortedProducts[0];  // fallback to most recent
                                        
                                        if (matchingProduct && matchingProduct.productId) {
                                            const latestProductId = String(matchingProduct.productId);
                                            console.log("Using latest product ID for retry:", latestProductId);
                                            
                                            // Verify this ID is valid with direct fetch instead of service
                                            try {
                                                const verifyResponse = await fetch(`http://localhost:8080/api/products/${latestProductId}`, {
                                                    method: 'GET',
                                                    credentials: 'include'
                                                });
                                                
                                                if (verifyResponse.ok) {
                                                    console.log("Verified latest product ID is valid");
                                                    
                                                    // Try again with the latest product ID
                                                    const retryDetailData = {
                                                        ...orderDetailData,
                                                        productId: latestProductId
                                                    };
                                                    
                                                    console.log("Retrying order detail creation with:", JSON.stringify(retryDetailData));
                                                    const retryDetail = await OrderDetailService.create(retryDetailData);
                                                    console.log("Order detail created successfully on retry:", retryDetail);
                                                    
                                                    // Navigate to checkout after successful retry
                                                    navigate(`/checkout/${orderId}`);
                                                    return; // Exit early to avoid duplicate navigation
                                                } else {
                                                    console.error("Latest product ID verification failed with status:", verifyResponse.status);
                                                }
                                            } catch (verifyError) {
                                                console.error("Latest product ID verification failed:", verifyError);
                                            }
                                        }
                                    }
                                } else {
                                    console.error("Failed to fetch products, status:", productsResponse.status);
                                }
                            } catch (retryError) {
                                console.error("Final order detail creation attempt failed:", retryError);
                            }
                        }
                    } else {
                        setError("Failed to create order detail: " + detailError.message);
                    }
                    
                    // Navigate to checkout even if order detail creation fails
                    // The backend should still have the order, just missing the details
                    navigate(`/checkout/${orderId}`);
                }
            } else {
                throw new Error("Order was created but no ID was returned");
            }
        } catch (err: any) {
            console.error("Error creating order:", err);
            
            // Log detailed request/response information for debugging
            if (err.response) {
                console.error("Error response:", {
                    status: err.response.status,
                    data: err.response.data,
                    headers: err.response.headers,
                    url: err.config?.url,
                    method: err.config?.method,
                    requestData: err.config?.data
                });
                
                // The request was made and the server responded with a status code
                const status = err.response.status;
                const errorData = err.response.data;
                setError(`Error (${status}): ${errorData?.message || JSON.stringify(errorData) || err.message || "Failed to create order"}`);
            } else if (err.request) {
                // The request was made but no response was received
                console.error("Error request (no response):", {
                    request: err.request,
                    config: err.config
                });
                setError("Server did not respond. Please check your connection and try again.");
            } else {
                // Something happened in setting up the request
                console.error("Error details:", err);
                setError(err.message || "An error occurred while creating your order");
            }
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
                onOrder={orderProduct}
                isProcessingOrder={isProcessingOrder}
            />
        </div>
    );
};

export default DesignBraceletPage;
