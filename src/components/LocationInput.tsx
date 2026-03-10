import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, MapPin } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  className?: string;
}

export default function LocationInput({ value, onChange, placeholder, icon, className }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 5 realistic location suggestions (city, landmark, or address) for a ride-hailing app based on this partial input: "${input}". Return only a JSON array of strings.`,
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
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        {icon}
      </div>
      <input 
        type="text" 
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-12 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm ${className}`}
        required
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Loader2 size={16} className="animate-spin text-zinc-400" />
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-black/5 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-50 flex items-center gap-3 transition-colors border-b border-zinc-50 last:border-0"
            >
              <MapPin size={14} className="text-zinc-400" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
