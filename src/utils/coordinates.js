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