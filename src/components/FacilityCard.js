import React from 'react';
import { formatDistance, formatPhoneNumber } from '../utils/formatters';
import './FacilityCard.css';

// calculateDistance 함수를 api.js에서 가져옴
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

const FacilityCard = ({ facility, onClose, userLocation }) => {
  const distanceText = facility.distance 
    ? formatDistance(facility.distance)
    : userLocation && facility.fcltyCrdntLa && facility.fcltyCrdntLo
      ? formatDistance(calculateDistance(
          userLocation.lat,
          userLocation.lng,
          Number(facility.fcltyCrdntLa),
          Number(facility.fcltyCrdntLo)
        ))
      : '';

  return (
    <div className="facility-card">
      <button className="close-button" onClick={onClose}>&times;</button>
      <h3>{facility.fcltyNm}</h3>
      <p className="address">{facility.fcltyAddr} {facility.fcltyDetailAddr}</p>
      {facility.rprsntvTelNo && (
        <p className="phone">
          <a href={`tel:${facility.rprsntvTelNo}`}>
            {formatPhoneNumber(facility.rprsntvTelNo)}
          </a>
        </p>
      )}
      {facility.mainItemNm && (
        <p className="main-item">{facility.mainItemNm}</p>
      )}
      {distanceText && (
        <p className="distance">현재 위치에서 {distanceText}</p>
      )}
    </div>
  );
};

export default FacilityCard;