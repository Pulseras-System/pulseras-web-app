import React, { useState } from 'react';
import { BraceletPart } from './types';
import PartPreview from '../PartPreview';

interface PartLibraryProps {
    availableParts: BraceletPart[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, part: BraceletPart) => void;
}

const PartLibrary: React.FC<PartLibraryProps> = ({ availableParts, onDragStart }) => {
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

    return (
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
            </div>
            
            <div style={{ padding: '15px' }}>
                {/* Category Tabs */}
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
                                onDragStart={(e) => onDragStart(e, part)}
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
                            >
                                <div style={{ 
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
                                        Drag to add to your design
                                    </div>
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
    );
};

export default PartLibrary;
