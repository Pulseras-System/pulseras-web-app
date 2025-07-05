import React from 'react';
import { RenderedObject } from './types';

interface PartsPanelProps {
    renderedObjects: RenderedObject[];
    selectedObject: string | null;
    setSelectedObject: (id: string | null) => void;
    removeObject: (id: string) => void;
    onSaveImage: () => void;
    onToggleAutoRotation?: () => void;
    isAutoRotating?: boolean;
    onOrder?: () => Promise<void>;
    isProcessingOrder?: boolean;
}

const PartsPanel: React.FC<PartsPanelProps> = ({ 
    renderedObjects, 
    selectedObject, 
    setSelectedObject, 
    removeObject,
    onSaveImage,
    onToggleAutoRotation,
    isAutoRotating,
    onOrder,
    isProcessingOrder
}) => {
    return (
        <div style={{
            width: '280px',
            background: 'linear-gradient(180deg, #4b5563 0%, #374151 100%)',
            borderLeft: '1px solid rgba(107, 114, 128, 0.3)',
            overflowY: 'auto',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.1)'
        }}>
            <div style={{ 
                padding: '25px 20px', 
                borderBottom: '1px solid rgba(107, 114, 128, 0.3)',
                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(75, 85, 99, 0.8))'
            }}>
                <h3 style={{ 
                    color: '#ffffff', 
                    marginBottom: '8px',
                    fontSize: '20px',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    🛠️ Bracelet Parts
                </h3>
                <p style={{ 
                    color: '#ddd', 
                    fontSize: '14px',
                    margin: '0'
                }}>
                    {renderedObjects.length} {renderedObjects.length === 1 ? 'part' : 'parts'} in your design
                </p>
                
                {/* Save Image Button */}
                <button
                    onClick={onSaveImage}
                    style={{
                        marginTop: '18px',
                        width: '100%',
                        padding: '14px',
                        background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                        color: 'white',
                        border: '1px solid rgba(107, 114, 128, 0.3)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #4b5563, #374151)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)';
                    }}
                >
                    <span>📷</span> Save as Image
                </button>
                
                {/* Auto Rotation Toggle Button */}
                {onToggleAutoRotation && (
                    <button
                        onClick={onToggleAutoRotation}
                        style={{
                            marginTop: '12px',
                            width: '100%',
                            padding: '14px',
                            background: isAutoRotating ? 
                                'linear-gradient(135deg, #10b981, #059669)' : 
                                'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: isAutoRotating ? 
                                '0 4px 15px rgba(16, 185, 129, 0.3)' : 
                                '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = isAutoRotating ? 
                                'linear-gradient(135deg, #059669, #047857)' : 
                                'linear-gradient(135deg, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.9))';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isAutoRotating ? 
                                'linear-gradient(135deg, #10b981, #059669)' : 
                                'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {isAutoRotating ? '🔄 Auto Rotate ON' : '⏸️ Auto Rotate OFF'}
                    </button>
                )}
            </div>
            
            <div style={{ padding: '15px' }}>
                {renderedObjects.length === 0 ? (
                    <div style={{ 
                        color: '#ddd', 
                        padding: '30px 20px', 
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.4), rgba(55, 65, 81, 0.6))',
                        borderRadius: '12px',
                        border: '1px dashed rgba(107, 114, 128, 0.3)',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{ 
                            fontSize: '32px', 
                            marginBottom: '15px',
                            color: '#9ca3af'
                        }}>
                            ✨
                        </div>
                        <div style={{ 
                            color: '#ffffff',
                            fontWeight: '600',
                            marginBottom: '8px',
                            fontSize: '16px'
                        }}>
                            Start Creating
                        </div>
                        <div style={{ 
                            color: '#ddd',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}>
                            Drag parts from the left panel to begin creating your custom bracelet.
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {renderedObjects.map((obj) => (
                            <div 
                                key={obj.id} 
                                onClick={() => setSelectedObject(obj.id)}
                                style={{
                                    background: selectedObject === obj.id ? 
                                        'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.15))' : 
                                        'linear-gradient(135deg, rgba(75, 85, 99, 0.6), rgba(55, 65, 81, 0.8))',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: selectedObject === obj.id ? 
                                        '1px solid rgba(107, 114, 128, 0.5)' : 
                                        '1px solid rgba(107, 114, 128, 0.2)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: selectedObject === obj.id ? 
                                        '0 0 20px rgba(107, 114, 128, 0.3)' : 
                                        '0 2px 8px rgba(0,0,0,0.1)',
                                    backdropFilter: 'blur(5px)'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    padding: '15px',
                                    gap: '10px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        width: '44px', 
                                        height: '44px', 
                                        borderRadius: '8px', 
                                        background: selectedObject === obj.id ?
                                            'linear-gradient(135deg, #6b7280, #4b5563)' :
                                            'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.9))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '22px',
                                        boxShadow: selectedObject === obj.id ?
                                            '0 0 15px rgba(107, 114, 128, 0.4)' :
                                            '0 2px 8px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {obj.partData.category === 'bases' ? '⚪' :
                                         obj.partData.category === 'charms' ? '⭐' : 
                                         obj.partData.category === 'gems' ? '💎' : '🔶'}
                                    </div>
                                    <div style={{ flex: '1' }}>
                                        <div style={{ 
                                            color: '#f0f0f0',
                                            fontWeight: '500',
                                            fontSize: '15px',
                                            marginBottom: '3px'
                                        }}>
                                            {obj.partData.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>
                                            Position: {obj.object.position.x.toFixed(1)}, {obj.object.position.y.toFixed(1)}, {obj.object.position.z.toFixed(1)}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeObject(obj.id);
                                        }}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            border: 'none',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9))',
                                            color: '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                        }}
                                        onMouseOver={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9))';
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>                                  {selectedObject === obj.id && (
                                    <div style={{ 
                                        padding: '0 15px 15px 15px',
                                        borderTop: '1px solid #444',
                                        marginTop: '5px'
                                    }}>
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: '#aaa', 
                                            margin: '10px 0 5px 0'
                                        }}>
                                            Click and drag in the workspace to position. Object rotates automatically for better viewing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Button */}
            {onOrder && (
                <div style={{ padding: '15px' }}>
                    <button
                        onClick={onOrder}
                        disabled={isProcessingOrder || renderedObjects.length === 0}
                        style={{
                            marginTop: '15px',
                            width: '100%',
                            padding: '16px',
                            background: renderedObjects.length === 0 ? 
                                'linear-gradient(135deg, rgba(107, 114, 128, 0.6), rgba(75, 85, 99, 0.6))' : 
                                'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: renderedObjects.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            opacity: renderedObjects.length === 0 ? 0.6 : 1,
                            boxShadow: renderedObjects.length === 0 ? 
                                'none' : 
                                '0 4px 15px rgba(34, 197, 94, 0.3)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                            if (renderedObjects.length > 0 && !isProcessingOrder) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (renderedObjects.length > 0 && !isProcessingOrder) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
                            }
                        }}
                    >
                        {isProcessingOrder ? (
                            <>
                                <div 
                                    style={{ 
                                        width: '16px', 
                                        height: '16px', 
                                        border: '2px solid white', 
                                        borderTopColor: 'transparent', 
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} 
                                /> 
                                Processing...
                            </>
                        ) : (
                            <>
                                <span>🛒</span> Add to Cart ({renderedObjects.length > 0 ? 
                                    `${(renderedObjects.length * 50000).toLocaleString()}₫` : 
                                    "Add parts first"})
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PartsPanel;
