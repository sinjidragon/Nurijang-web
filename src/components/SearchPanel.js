import React from 'react';

const SearchPanel = ({ 
  suggestions, 
  onSelectFacility, 
  onSelectItem, 
  searchText, 
  setSearchText 
}) => {
  if (!suggestions) return null;

  return (
    <div className="search-panel">
      {suggestions?.mainItems?.length > 0 && (
        <div className="search-section">
          <h3 className="text-sm font-semibold mb-2">종목</h3>
          {suggestions.mainItems.map((item, index) => (
            <div
              key={index}
              className="search-item flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectItem(item)}
            >
              <span className="material-icons mr-2">sports</span>
              {item}
            </div>
          ))}
        </div>
      )}

      {suggestions?.facilities?.length > 0 && (
        <div className="search-section">
          <h3 className="text-sm font-semibold mb-2">시설명</h3>
          {suggestions.facilities.map((facility) => (
            <div
              key={facility.id}
              className="search-item flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectFacility(facility)}
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
  );
};

export default SearchPanel;