// hooks/useMapState.js
import { useState, useRef, useCallback } from 'react';
import { fetchNearbyFacilities } from '../services/api';

export const useMapState = () => {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
  const [facilities, setFacilities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const mapRef = useRef(null);

  const getCurrentLocation = useCallback(async () => {
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
      const data = await fetchNearbyFacilities(location);
      setFacilities(data);
    } catch (error) {
      setError("위치 정보를 가져올 수 없습니다. 위치 서비스가 활성화되어 있는지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCurrentLocation = useCallback(async () => {
    if (!mapRef.current?.state?.map) return;

    setLoading(true);
    setError(null);
    try {
      const map = mapRef.current.state.map;
      const center = map.getCenter();
      const location = {
        lat: center.lat(),
        lng: center.lng()
      };
      setUserLocation(location);  // 현재 지도 중심을 사용자 위치로 설정

      const data = await fetchNearbyFacilities(location);
      setFacilities(data);
    } catch (error) {
      setError("현재 지도 위치에서 시설을 검색하는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    center,
    setCenter,
    facilities,
    setFacilities,
    userLocation,
    setUserLocation,
    loading,
    setLoading,
    error,
    setError,
    selectedFacility,
    setSelectedFacility,
    mapRef,
    getCurrentLocation,
    searchCurrentLocation
  };
};