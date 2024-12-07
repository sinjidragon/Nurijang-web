const base_url = process.env.REACT_APP_BASE_URL;

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

const validateFacility = (facility) => {
  return {
    id: facility.id || 0,
    fcltyCrdntLa: Number(facility.fcltyCrdntLa || 0),
    fcltyCrdntLo: Number(facility.fcltyCrdntLo || 0),
    fcltyNm: facility.fcltyNm?.replace('location_on', '').trim() || '',
    fcltyAddr: facility.fcltyAddr || '',
    fcltyDetailAddr: facility.fcltyDetailAddr || '',
    rprsntvTelNo: facility.rprsntvTelNo || '',
    mainItemNm: facility.mainItemNm || '',
    distance: facility.distance || 0
  };
};

export const fetchNearbyFacilities = async (location) => {
  try {
    const response = await fetch(`${base_url}/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fcltyCrdntLo: Number(location.lng).toFixed(6),
        fcltyCrdntLa: Number(location.lat).toFixed(6)
      })
    });

    if (!response.ok) throw new Error('시설 정보를 가져오는데 실패했습니다.');
    const data = await response.json();
    
    return Array.isArray(data) ? data.map(validateFacility) : [];
  } catch (error) {
    console.error('Facilities fetch error:', error);
    throw error;
  }
};

export const searchFacilities = async (params) => {
  try {
    const { searchType, searchText, location } = params;
    const url = `${base_url}${searchType === 'item' ? '/search-item' : '/search'}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fcltyCrdntLo: Number(location.lng).toFixed(6),
        fcltyCrdntLa: Number(location.lat).toFixed(6),
        searchText: searchText.trim()
      })
    });

    if (!response.ok) throw new Error('검색에 실패했습니다.');
    const data = await response.json();
    
    return Array.isArray(data) ? data.map(validateFacility).sort((a, b) => a.distance - b.distance) : [];
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const fetchSuggestions = async (searchText, location) => {
  try {
    if (!searchText?.trim()) return null;

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.error('Invalid location:', location);
      return null;
    }

    const response = await fetch(`${base_url}/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fcltyCrdntLo: Number(location.lng).toFixed(6),
        fcltyCrdntLa: Number(location.lat).toFixed(6),
        searchText: searchText.trim()
      })
    });

    if (!response.ok) throw new Error('추천 검색어를 가져오는데 실패했습니다.');
    const data = await response.json();

    const processedData = {
      mainItems: Array.isArray(data.mainItems) ? data.mainItems : [],
      facilities: Array.isArray(data.facilities) ? data.facilities.map(facility => {
        const processedFacility = validateFacility(facility);
        
        if (location && processedFacility.fcltyCrdntLa && processedFacility.fcltyCrdntLo) {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            Number(processedFacility.fcltyCrdntLa),
            Number(processedFacility.fcltyCrdntLo)
          );
          processedFacility.distance = distance;
        }

        return processedFacility;
      }).sort((a, b) => (a.distance || 0) - (b.distance || 0)) : []
    };

    return processedData;
  } catch (error) {
    console.error('Suggestions fetch error:', error);
    throw error;
  }
};