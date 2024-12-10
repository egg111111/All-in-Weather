import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import "./NearbySearch.css";

const NearbySearch = ({ onPlaceSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null); // 마커 상태
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({
    lat: 37.5665,
    lng: 126.9780,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && !map) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(
          currentPosition.lat,
          currentPosition.lng
        ),
        level: 3,
      };
      const kakaoMap = new window.kakao.maps.Map(container, options);

      const newMarker = new window.kakao.maps.Marker({
        map: kakaoMap,
      });
      setMarker(newMarker); // 마커 생성 및 상태에 저장

      window.kakao.maps.event.addListener(kakaoMap, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;

        // 마커 위치 업데이트
        newMarker.setPosition(latlng);

        // 좌표 → 주소 및 장소명 변환
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(
          latlng.getLng(),
          latlng.getLat(),
          (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const address = result[0]?.address?.address_name;

              // 장소 검색(Places API)
              const places = new window.kakao.maps.services.Places();
              places.keywordSearch(
                address, // 주소를 키워드로 사용
                (data, searchStatus) => {
                  if (
                    searchStatus === kakao.maps.services.Status.OK &&
                    data.length > 0
                  ) {
                    const placeName = data[0]?.place_name || "알 수 없는 장소"; // 첫 번째 장소명
                    setSelectedPlace({
                      address: result[0]?.address?.address_name || "주소 없음",
                      placeName,
                      lat: latlng.getLat(),
                      lng: latlng.getLng(),
                    });
                  } else {
                    // 검색 결과 없음 처리
                    setSelectedPlace({
                      address: result[0]?.address?.address_name || "주소 없음",
                      placeName: "알 수 없는 장소",
                      lat: latlng.getLat(),
                      lng: latlng.getLng(),
                    });
                  }
                },
                {
                  location: latlng, // 클릭한 위치를 기준으로 검색
                  radius: 500, // 반경 500m
                }
              );
            }
          }
        );
      });

      setMap(kakaoMap);
    }
  }, [isModalOpen, currentPosition]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>주변 검색</Button>
      <Modal
        title="주변 검색"
        visible={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
        bodyStyle={{ padding: "20px", textAlign: "center" }}
      >
        <div id="map" style={{ width: "110%", height: "400px", margin: "0 auto" }}></div>
        {selectedPlace && (
          <div style={{ marginTop: "10px", padding: "10px" }}>
            <h4>선택된 장소</h4>
            <p>주소: {selectedPlace.address}</p>
            <p>장소명: {selectedPlace.placeName}</p>
            <Button
              type="primary"
              onClick={() => {
                onPlaceSelect({
                  place_name: selectedPlace.placeName,
                  road_address_name: selectedPlace.address,
                  latitude: selectedPlace.lat,
                  longitude: selectedPlace.lng,
                });
                closeModal();
              }}
            >
              선택
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NearbySearch;
