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
                background: 'linear-gradient(180deg, #4b5563 0%, #374151 100%)',
                borderRight: '1px solid rgba(107, 114, 128, 0.2)',
                padding: '0',
                overflowY: 'auto',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
            }}
        >
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
                    ✨ Bracelet Parts Library
                </h3>
                <p style={{ 
                    color: '#ddd', 
                    fontSize: '14px',
                    margin: '0'
                }}>
                    Drag parts to create your perfect bracelet
                </p>
            </div>
            
            {/* Search Bar */}
            <div style={{ 
                padding: '20px 15px',
                borderBottom: '1px solid rgba(107, 114, 128, 0.2)',
                background: 'linear-gradient(135deg, #4b5563, #374151)',
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
                            padding: '12px 40px 12px 18px',
                            border: '1px solid rgba(107, 114, 128, 0.3)',
                            borderRadius: '8px',
                            background: 'rgba(55, 65, 81, 0.8)',
                            color: '#ddd',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(5px)'
                        }}
                        onFocus={(e) => {
                            e.target.style.border = '1px solid #6b7280';
                            e.target.style.boxShadow = '0 0 0 3px rgba(107, 114, 128, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.border = '1px solid rgba(107, 114, 128, 0.3)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <span style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '15px', 
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        fontSize: '16px'
                    }}>
                        🔍
                    </span>
                </div>
            </div>
            
            <div style={{ padding: '15px' }}>
                {/* Category Tabs */}
                <div style={{ 
                    display: 'flex', 
                    backgroundColor: 'rgba(75, 85, 99, 0.6)',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(107, 114, 128, 0.2)',
                    backdropFilter: 'blur(5px)'
                }}>
                    <button 
                        style={{ 
                            flex: 1, 
                            padding: '12px', 
                            border: 'none', 
                            background: selectedCategory === null ? 
                                'linear-gradient(135deg, #6b7280, #4b5563)' : 
                                'rgba(55, 65, 81, 0.6)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: selectedCategory === null ? '700' : '500',
                            transition: 'all 0.3s ease',
                            fontSize: '14px',
                            boxShadow: selectedCategory === null ? 
                                '0 0 10px rgba(107, 114, 128, 0.3)' : 'none'
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
                                padding: '12px', 
                                border: 'none', 
                                background: selectedCategory === category ? 
                                    'linear-gradient(135deg, #6b7280, #4b5563)' : 
                                    'rgba(55, 65, 81, 0.6)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: selectedCategory === category ? '700' : '500',
                                transition: 'all 0.3s ease',
                                fontSize: '14px',
                                boxShadow: selectedCategory === category ? 
                                    '0 0 10px rgba(107, 114, 128, 0.3)' : 'none'
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
                        {(searchQuery || selectedCategory) && (                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory(null);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#9ca3af',
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
                                    borderRadius: '12px',
                                    cursor: 'grab',
                                    background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.9))',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(107, 114, 128, 0.2)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    backdropFilter: 'blur(5px)'
                                }}
                                onMouseOver={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.02)';
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.3)';
                                    (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(107, 114, 128, 0.5)';
                                }}
                                onMouseOut={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)';
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                                    (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(107, 114, 128, 0.2)';
                                }}
                            >
                                <div style={{ 
                                    background: 'linear-gradient(135deg, rgba(34, 43, 60, 0.9), rgba(42, 52, 71, 0.8))',
                                    padding: '15px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '150px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <PartPreview modelPath={part.modelPath} size={120} />
                                </div>
                                <div style={{ padding: '18px' }}>
                                    <div style={{ 
                                        fontWeight: '600', 
                                        color: '#ffffff',
                                        fontSize: '16px',
                                        marginBottom: '8px',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}>
                                        {part.name}
                                    </div>
                                    <div style={{ 
                                        color: '#ddd', 
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{ 
                                            display: 'inline-block',
                                            width: '18px',
                                            height: '18px',
                                            background: 'linear-gradient(135deg, #6C01F4, #8B5CF6)',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 10px rgba(108, 1, 244, 0.5)'
                                        }}></span>
                                        <span style={{ fontWeight: '500' }}>Drag to add to your design</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{
                            padding: '40px 20px',
                            background: 'linear-gradient(135deg, rgba(56, 66, 86, 0.6), rgba(42, 52, 71, 0.8))',
                            borderRadius: '12px',
                            textAlign: 'center',
                            border: '1px dashed rgba(108, 1, 244, 0.3)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            <div style={{ 
                                fontSize: '32px', 
                                marginBottom: '15px',
                                color: '#6C01F4'
                            }}>
                                😕
                            </div>
                            <div style={{ 
                                color: '#ffffff',
                                fontWeight: '600', 
                                marginBottom: '8px',
                                fontSize: '16px'
                            }}>
                                No parts found
                            </div>
                            <div style={{ color: '#ddd', fontSize: '14px' }}>
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
