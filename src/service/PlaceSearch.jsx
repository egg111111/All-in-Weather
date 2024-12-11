import React, { useState } from "react";

const PlaceSearch = ({ onPlaceSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const searchPlaces = (query) => {
    const { kakao } = window;
    const places = new kakao.maps.services.Places();

    places.keywordSearch(query, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setSearchResults(result); // 검색 결과 저장
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="장소를 검색하세요"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") searchPlaces(searchQuery);
        }}
      />
      <ul>
        {searchResults.map((place, index) => (
          <li
            key={index}
            onClick={() =>
              onPlaceSelect({
                place_name: place.place_name,
                road_address_name: place.road_address_name || place.address_name,
                latitude: parseFloat(place.y), // 위도 추가
                longitude: parseFloat(place.x), // 경도 추가
              })
            } // 장소 선택 시 부모로 전달
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            {place.place_name} ({place.road_address_name || place.address_name})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaceSearch;
