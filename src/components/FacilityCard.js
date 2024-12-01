// components/FacilityCard.js
import React from 'react';
import './FacilityCard.css';

const FacilityCard = ({ facility, onClose }) => (
  <div className="facility-card">
    <button className="close-button" onClick={onClose}>&times;</button>
    <h3>{facility.fcltyNm}</h3>
    <p className="address">{facility.fcltyAddr} {facility.fcltyDetailAddr}</p>
    {facility.rprsntvTelNo && (
      <p className="phone">
        <a href={`tel:${facility.rprsntvTelNo}`}>{facility.rprsntvTelNo}</a>
      </p>
    )}
    {facility.mainItemNm && (
      <p className="main-item">{facility.mainItemNm}</p>
    )}
    <p className="distance">현재 위치에서 {facility.distance.toFixed(1)}km</p>
  </div>
);

export default FacilityCard;