// src/utils/coordinates.js
export const isValidCoordinate = (value) => {
  if (value === undefined || value === null) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

export const parseCoordinates = (lat, lng) => {
  // 상세한 디버깅 로그
  console.log('Parsing coordinates input:', {
    lat: { value: lat, type: typeof lat },
    lng: { value: lng, type: typeof lng }
  });

  // 좌표가 없는 경우
  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    console.error('Missing coordinates:', { lat, lng });
    return null;
  }

  // 문자열인 경우 숫자로 변환
  const parsedLat = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
  const parsedLng = typeof lng === 'string' ? parseFloat(lng) : Number(lng);

  // 유효성 검사
  if (!isValidCoordinate(parsedLat) || !isValidCoordinate(parsedLng)) {
    console.error('Invalid coordinates after parsing:', {
      original: { lat, lng },
      parsed: { lat: parsedLat, lng: parsedLng }
    });
    return null;
  }

  // 좌표 범위 검사 (한국 기준으로 범위 조정)
  if (parsedLat < 33 || parsedLat > 39 || parsedLng < 124 || parsedLng > 132) {
    console.error('Coordinates out of Korea range:', { lat: parsedLat, lng: parsedLng });
    return null;
  }

  return {
    lat: parsedLat,
    lng: parsedLng
  };
};

// 두 좌표 사이의 거리 계산 (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lon1) || 
      !isValidCoordinate(lat2) || !isValidCoordinate(lon2)) {
    return null;
  }

  const R = 6371; // 지구의 반지름 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 킬로미터 단위 거리
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};
