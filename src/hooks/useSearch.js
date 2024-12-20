// hooks/useSearch.js
import { useState, useEffect, useRef } from 'react';

export const useSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const searchPanelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
        setShowSearchPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetSearchPanel = () => {
    setShowSearchPanel(false);
  };

  return {
    searchText,
    setSearchText,
    suggestions,
    setSuggestions,
    showSearchPanel,
    setShowSearchPanel,
    searchPanelRef,
    resetSearchPanel
  };
};