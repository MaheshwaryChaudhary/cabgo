import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export default function DateInput({ value, onChange, placeholder, className }: DateInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 5 natural language date suggestions based on this partial input: "${input}". For example, if input is "tom", suggest "Tomorrow", "Tomorrow morning", etc. If input is empty, suggest "Today", "Tomorrow", "Next Monday", "Next Friday", "In 2 hours". Return only a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      setSuggestions(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching date suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    fetchSuggestions(newValue);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
        <Calendar size={18} />
      </div>
      <input 
        type="text" 
        value={value}
        onChange={handleInputChange}
        onFocus={() => fetchSuggestions(value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm ${className}`}
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Loader2 size={16} className="animate-spin text-zinc-400" />
        </div>
      )}

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-black/5 rounded-2xl shadow-xl overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-50 flex items-center gap-3 transition-colors border-b border-zinc-50 last:border-0"
              >
                <Calendar size={14} className="text-zinc-400" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
