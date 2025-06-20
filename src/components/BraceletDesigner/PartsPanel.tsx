import React from 'react';
import { RenderedObject } from './types';

interface PartsPanelProps {
    renderedObjects: RenderedObject[];
    selectedObject: string | null;
    setSelectedObject: (id: string | null) => void;
    removeObject: (id: string) => void;
}

const PartsPanel: React.FC<PartsPanelProps> = ({ 
    renderedObjects, 
    selectedObject, 
    setSelectedObject, 
    removeObject 
}) => {
    return (
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
                                onClick={() => setSelectedObject(obj.id)}
                                style={{
                                    background: selectedObject === obj.id ? '#3a3a3a' : '#2a2a2a',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: selectedObject === obj.id ? '1px solid #4CAF50' : '1px solid #444',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    padding: '15px',
                                    gap: '10px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '6px', 
                                        background: '#333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
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
                                            width: '24px',
                                            height: '24px',
                                            border: 'none',
                                            borderRadius: '50%',
                                            background: '#444',
                                            color: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background = '#d32f2f';
                                        }}
                                        onMouseOut={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background = '#444';
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {selectedObject === obj.id && (
                                    <div style={{ 
                                        padding: '0 15px 15px 15px',
                                        borderTop: '1px solid #444',
                                        marginTop: '5px'
                                    }}>
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: '#aaa', 
                                            margin: '10px 0 15px 0'
                                        }}>
                                            Click and drag in the workspace to position
                                        </p>
                                        {/* Could add more controls here for rotation, scaling, etc. */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartsPanel;
