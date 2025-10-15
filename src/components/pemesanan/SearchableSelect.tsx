import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/Input';

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
    const [inputValue, setInputValue] = useState(value || "");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    const handleOptionClick = (option) => {
        setInputValue(option);
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <Input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                autoComplete="off"
            />
            {isOpen && (
                <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-slate-500">Tidak ada pilihan</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default SearchableSelect;

