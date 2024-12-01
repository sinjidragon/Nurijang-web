// 시설 데이터 검증 함수
const validateFacility = (facility) => {
    return {
      ...facility,
      fcltyCrdntLa: facility.fcltyCrdntLa || 0,
      fcltyCrdntLo: facility.fcltyCrdntLo || 0,
      fcltyNm: facility.fcltyNm || '',
      fcltyAddr: facility.fcltyAddr || '',
      distance: facility.distance || 0
    };
  };
  
  export const fetchNearbyFacilities = async (location) => {
    try {
      const response = await fetch('${BASE_URL}/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fcltyCrdntLo: Number(location.lng).toFixed(6),
          fcltyCrdntLa: Number(location.lat).toFixed(6)
        })
      });
  
      if (!response.ok) throw new Error('시설 정보를 가져오는데 실패했습니다.');
      const data = await response.json();
      
      // 응답 데이터 검증 및 정제
      return Array.isArray(data) ? data.map(validateFacility) : [];
    } catch (error) {
      console.error('Facilities fetch error:', error);
      throw error;
    }
  };
  
  export const searchFacilities = async (params) => {
    try {
      const { searchType, searchText, location } = params;
      const url = searchType === 'item' ? '${BASE_URL}/search-item' : '/search';
      
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
      
      // 응답 데이터 검증 및 정제
      return Array.isArray(data) ? data.map(validateFacility) : [];
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };
  
  export const fetchSuggestions = async (searchText, location) => {
    try {
      if (!searchText?.trim()) return null;
      
      const response = await fetch('${BASE_URL}/suggestions', {
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
      
      // 시설 목록이 있는 경우에만 검증 및 정제
      if (data?.facilities) {
        data.facilities = data.facilities.map(validateFacility);
      }
      
      return data;
    } catch (error) {
      console.error('Suggestions fetch error:', error);
      throw error;
    }
  };