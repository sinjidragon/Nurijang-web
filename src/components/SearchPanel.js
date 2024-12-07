import React from 'react';
import { formatDistance } from '../utils/formatters';
import { Activity, MapPin } from 'lucide-react';

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
          <h3 className="text-sm font-semibold mb-2">
            <span className="flex items-center">
              <Activity className="mr-2" size={16} />
              종목
            </span>
          </h3>
          {suggestions.mainItems.map((item, index) => (
            <div
              key={index}
              className="search-item flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectItem(item)}
            >
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      )}

      {suggestions?.facilities?.length > 0 && (
        <div className="search-section">
          <h3 className="text-sm font-semibold mb-2">
            <span className="flex items-center">
              <MapPin className="mr-2" size={16} />
              시설명
            </span>
          </h3>
          {suggestions.facilities.map((facility) => (
            <div
              key={facility.id}
              className="search-item flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectFacility(facility)}
            >
              <div className="ml-2">
                <div>{facility.fcltyNm}</div>
                {typeof facility.distance === 'number' && facility.distance >= 0 && (
                  <div className="text-sm text-gray-500">
                    {formatDistance(facility.distance)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPanel;