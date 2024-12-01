import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import LoadingSpinner from './components/LoadingSpinner';
import FacilityCard from './components/FacilityCard';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBR3XR176Wj4TBWWcH2qY_tungtmqpofVw';

const App = () => {
  const [center, setCenter] = useState({
    lat: 37.5665,
    lng: 126.9780
  });
  const [facilities, setFacilities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const searchPanelRef = useRef(null);
  const mapRef = useRef(null);

  const mapStyles = {
    height: "100vh",
    width: "100%"
  };

  const userLocationIcon = {
    url: "data:image/svg+xml;base64," + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
      </svg>
    `),
    scaledSize: { width: 24, height: 24 },
    anchor: { x: 12, y: 12 }
  };

  const facilityIcon = {
    url: "data:image/svg+xml;base64," + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12C6 19.25 16 30 16 30C16 30 26 19.25 26 12C26 6.48 21.52 2 16 2ZM16 15C14.34 15 13 13.66 13 12C13 10.34 14.34 9 16 9C17.66 9 19 10.34 19 12C19 13.66 17.66 15 16 15Z" fill="#4285F4"/>
      </svg>
    `),
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
        setShowSearchPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setUserLocation(location);
      setCenter(location);
      await fetchNearbyFacilities(location);
    } catch (error) {
      setError("위치 정보를 가져올 수 없습니다. 위치 서비스가 활성화되어 있는지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // New function to search facilities in current map view
  const searchCurrentLocation = async () => {
    if (!mapRef.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const map = mapRef.current.state.map;
      const center = map.getCenter();
      const location = {
        lat: center.lat(),
        lng: center.lng()
      };
      
      await fetchNearbyFacilities(location);
    } catch (error) {
      setError("현재 지도 위치에서 시설을 검색하는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!searchText.trim()) {
      setSuggestions(null);
      return;
    }

    try {
      const response = await fetch('/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fcltyCrdntLo: userLocation?.lng || center.lng,
          fcltyCrdntLa: userLocation?.lat || center.lat,
          searchText: searchText
        })
      });

      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSearch = async (searchType = 'search', facility = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = searchType === 'item' ? '/search-item' : '/search';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fcltyCrdntLo: userLocation?.lng || center.lng,
          fcltyCrdntLa: userLocation?.lat || center.lat,
          searchText: searchText
        })
      });

      if (!response.ok) throw new Error('검색에 실패했습니다.');
      const data = await response.json();
      setFacilities(data);
      setShowSearchPanel(false);

      // If facility is provided, center map on that facility
      if (facility) {
        const newCenter = {
          lat: facility.fcltyCrdntLa,
          lng: facility.fcltyCrdntLo
        };
        setCenter(newCenter);
      }
      // Otherwise center on first result if exists
      else if (data.length > 0) {
        setCenter({
          lat: data[0].fcltyCrdntLa,
          lng: data[0].fcltyCrdntLo
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyFacilities = async (location) => {
    try {
      const response = await fetch('/facilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fcltyCrdntLo: location.lng,
          fcltyCrdntLa: location.lat
        })
      });

      if (!response.ok) throw new Error('시설 정보를 가져오는데 실패했습니다.');
      const data = await response.json();
      setFacilities(data);
    } catch (error) {
      setError(error.message);
      setFacilities([]);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (showSearchPanel) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText, showSearchPanel]);

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
          <div className="search-panel">
            {suggestions?.mainItems && suggestions.mainItems.length > 0 && (
              <div className="search-section">
                <h3 className="text-sm font-semibold mb-2">종목</h3>
                {suggestions.mainItems.map((item, index) => (
                  <div
                    key={index}
                    className="search-item flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchText(item);
                      handleSearch('item');
                      setShowSearchPanel(false);
                    }}
                  >
                    <span className="material-icons mr-2">sports</span>
                    {item}
                  </div>
                ))}
              </div>
            )}

            {suggestions?.facilities && suggestions.facilities.length > 0 && (
              <div className="search-section">
                <h3 className="text-sm font-semibold mb-2">시설명</h3>
                {suggestions.facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="search-item flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      const selectedLocation = {
                        lat: facility.fcltyCrdntLa,
                        lng: facility.fcltyCrdntLo
                      };
                      setSearchText(facility.fcltyNm);
                      setCenter(selectedLocation);
                      setSelectedFacility(facility);
                      setShowSearchPanel(false);
                      
                      // 지도를 해당 위치로 부드럽게 이동
                      if (mapRef.current) {
                        const map = mapRef.current.state.map;
                        map.panTo(selectedLocation);
                      }
                    }}
                  >
                    <span className="material-icons mr-2">location_on</span>
                    <div>
                      <div>{facility.fcltyNm}</div>
                      <div className="text-sm text-gray-500">{Math.round(facility.distance)}m</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          mapContainerStyle={mapStyles}
          zoom={15}
          center={center}
          onClick={() => {
            setSelectedFacility(null);
            setShowSearchPanel(false);
          }}
          options={{
            zoomControl: true,
            zoomControlOptions: {
              position: 9
            }
          }}
          ref={mapRef}
        >
          {userLocation && <MarkerF position={userLocation} icon={userLocationIcon} />}
          
          {facilities.map((facility) => (
            <MarkerF
              key={facility.id}
              position={{
                lat: facility.fcltyCrdntLa,
                lng: facility.fcltyCrdntLo
              }}
              icon={facilityIcon}
              onClick={() => setSelectedFacility(facility)}
            />
          ))}
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