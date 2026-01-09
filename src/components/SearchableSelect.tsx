import React, { useState, useEffect, useRef } from 'react';

interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLabel, setDisplayLabel] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selectedOption = options.find(opt => opt.value === value);
        if (selectedOption) {
            setDisplayLabel(selectedOption.label);
        } else {
            setDisplayLabel('');
        }
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search term to current value label on close
                const selectedOption = options.find(opt => opt.value === value);
                if (selectedOption) {
                    setSearchTerm('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [options, value]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: Option) => {
        onChange(option.value);
        setDisplayLabel(option.label);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {name && <input type="hidden" name={name} value={value} />}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    background: disabled ? '#333' : '#222',
                    color: disabled ? '#888' : 'white',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '42px'
                }}
            >
                <span>{displayLabel || <span style={{ color: '#888' }}>{placeholder}</span>}</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>▼</span>
            </div>

            {isOpen && !disabled && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: '#222',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    marginTop: '5px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type to search..."
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            borderBottom: '1px solid #444',
                            background: '#1a1a1a',
                            color: 'white',
                            outline: 'none',
                            boxSizing: 'border-box' // Important for padding inside width
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    borderBottom: '1px solid #333',
                                    backgroundColor: option.value === value ? '#333' : 'transparent',
                                    color: 'white'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
                                onMouseLeave={(e) => e.currentTarget.style.background = option.value === value ? '#333' : 'transparent'}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px', color: '#888', textAlign: 'center' }}>
                            No matches found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
