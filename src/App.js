// src/App.js
import React, { useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import LoadingSpinner from './components/LoadingSpinner';
import FacilityCard from './components/FacilityCard';
import ErrorMessage from './components/ErrorMessage';
import SearchPanel from './components/SearchPanel';
import { useMapState } from './hooks/useMapState';
import { useSearch } from './hooks/useSearch';
import { fetchSuggestions, searchFacilities } from './services/api';
import { GOOGLE_MAPS_API_KEY, MAP_STYLES, MAP_ICONS } from './constants/config';
import ChatComponent from './components/ChatComponent';

import './App.css';

const App = () => {
  const { 
    center, setCenter, facilities, setFacilities, 
    userLocation, setUserLocation, loading, setLoading, 
    error, setError, selectedFacility, setSelectedFacility, 
    mapRef, getCurrentLocation, searchCurrentLocation 
  } = useMapState();

  const { 
    searchText, setSearchText, suggestions, setSuggestions, 
    showSearchPanel, setShowSearchPanel, searchPanelRef,
    resetSearchPanel 
  } = useSearch();

  const handleSearch = useCallback(async (searchType = 'search', facility = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentLocation = {
        lat: userLocation?.lat || center.lat || 37.5665,
        lng: userLocation?.lng || center.lng || 126.9780
      };

      const data = await searchFacilities({
        searchType,
        searchText,
        location: currentLocation
      });

      setFacilities(data);
      resetSearchPanel();

      if (facility && facility.fcltyCrdntLa !== 0 && facility.fcltyCrdntLo !== 0) {
        setCenter({
          lat: Number(facility.fcltyCrdntLa),
          lng: Number(facility.fcltyCrdntLo)
        });
      } else if (data.length > 0 && data[0].fcltyCrdntLa !== 0 && data[0].fcltyCrdntLo !== 0) {
        setCenter({
          lat: Number(data[0].fcltyCrdntLa),
          lng: Number(data[0].fcltyCrdntLo)
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [center, searchText, userLocation, setFacilities, setCenter, setError, setLoading, resetSearchPanel]);

  const handleSelectFacility = useCallback((facility) => {
    if (!facility) return;

    if (facility.fcltyCrdntLa === 0 || facility.fcltyCrdntLo === 0) {
      console.warn('Facility has invalid coordinates (0,0):', facility.fcltyNm);
      return;
    }
    
    setSearchText(facility.fcltyNm || '');
    const coordinates = {
      lat: Number(facility.fcltyCrdntLa),
      lng: Number(facility.fcltyCrdntLo)
    };
    
    setCenter(coordinates);
    setSelectedFacility(facility);
    resetSearchPanel();
      
    if (mapRef.current?.state?.map) {
      const map = mapRef.current.state.map;
      map.panTo(coordinates);
      map.setZoom(15);
    }
  }, [setSearchText, setCenter, setSelectedFacility, resetSearchPanel, mapRef]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (showSearchPanel && searchText.trim()) {
        fetchSuggestions(searchText, center)
          .then(setSuggestions)
          .catch(console.error);
      } else {
        setSuggestions(null);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText, showSearchPanel, center]);

  return (
    <div className="app-container">
      <div className="search-container" ref={searchPanelRef}>
        <div className="search-bar">
          <input 
            type="text" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setShowSearchPanel(true)}
            placeholder="시설명 혹은 주소 검색"
            className="search-input"
          />
        </div>

        {showSearchPanel && (
          <SearchPanel
            suggestions={suggestions}
            onSelectFacility={handleSelectFacility}
            onSelectItem={(item) => {
              setSearchText(item);
              handleSearch('item');
            }}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <div className="button-container">
        <button
          className="location-button"
          onClick={getCurrentLocation}
          disabled={loading}
        >
          내 위치 보기
        </button>
        <button
          className="location-button"
          onClick={searchCurrentLocation}
          disabled={loading}
        >
          현재 위치 검색
        </button>
      </div>

      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={MAP_STYLES}
          zoom={15}
          center={center}
          onClick={() => {
            setSelectedFacility(null);
            resetSearchPanel();
          }}
          options={{
            zoomControl: true,
            zoomControlOptions: {
              position: 9
            }
          }}
          ref={mapRef}
        >
          {userLocation && (
            <MarkerF 
              position={userLocation} 
              icon={MAP_ICONS.user} 
            />
          )}
          
          {facilities.map((facility) => {
            if (facility.fcltyCrdntLa === 0 || facility.fcltyCrdntLo === 0) return null;

            return (
              <MarkerF
                key={facility.id}
                position={{
                  lat: Number(facility.fcltyCrdntLa),
                  lng: Number(facility.fcltyCrdntLo)
                }}
                icon={MAP_ICONS.facility}
                onClick={() => setSelectedFacility(facility)}
              />
            );
          })}
        </GoogleMap>
      </LoadScript>

      {selectedFacility && (
        <FacilityCard
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </div>
  );
};

export default App;