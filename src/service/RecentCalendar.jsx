import React, { useState, useEffect, useContext } from "react";
import "./RecentCalendar.css";
import generalApiClient from "../service/generalApiClient";
import ReactModal from "react-modal";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import Timepicker from "./TimePicker";
import PlaceSearch from "./PlaceSearch";
import NearbySearch from "./NearbySearch";
import { Button, Modal as AntdModal } from "antd"; // TimePicker 추가
import moment from "moment"; // 추가
import "moment/locale/ko"; // 한국어 로케일 추가
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTitle } from "../reducers/titleSlice.js";

import { UserDataContext } from "./userDataProvider.jsx";


//아이콘 추가 임포트
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";


moment.locale("ko"); // moment의 로케일을 한국어로 설정
ReactModal.setAppElement("#root");

const RecentCalendar = () => {
  const {userInfo} = useContext(UserDataContext)
  const location = useLocation();
  const { userData } = location.state || {};

  const dispatch = useDispatch();
    
  useEffect(() => {
      dispatch(setTitle('일정'));
  }, [dispatch]);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getRecentDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
  
    const dates = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day)); // 매일 새로운 Date 객체 생성
    }
    return dates;
  };

  const getMonthDatesWithPlaceholders = (date) => {
    const monthDates = getMonthDates(date);
    const firstDayOfWeek = monthDates[0].getDay(); // 첫 번째 날의 요일
  
    const datesWithPlaceholders = [];
  
    // 첫 번째 주의 빈 칸(null) 추가
    for (let i = 0; i < firstDayOfWeek; i++) {
      datesWithPlaceholders.push(null);
    }
  
    // 실제 날짜 추가
    datesWithPlaceholders.push(...monthDates);
  
    // 마지막 주를 7칸으로 채우기
    while (datesWithPlaceholders.length % 7 !== 0) {
      datesWithPlaceholders.push(null); // 빈 칸(null) 추가
    }
  
    return datesWithPlaceholders;
  };

  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth); // 상태 업데이트
  }; 

  const recentDates = getRecentDates();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthDates, setMonthDates] = useState(getMonthDatesWithPlaceholders(currentMonth));
  const [selectedDate, setSelectedDate] = useState(recentDates[0]);
  const [selectedTime, setSelectedTime] = useState(null);

  const [activities, setActivities] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [isReactModalOpen, setIsReactModalOpen] = useState(false);
  const [isAntdModalOpen, setIsAntdModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const [customActivity, setCustomActivity] = useState(""); // 사용자 입력 저장
  const [viewMode, setViewMode] = useState("week");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [editActivityMode, setEditActivityMode] = useState(false); // 활동명 수정 모드
  const [editedActivityName, setEditedActivityName] = useState(""); // 수정 중인 활동명
  const [editedPlaceName, setEditedPlaceName] = useState(""); // 수정 중인 장소명
  const [isPlaceEditModalOpen, setIsPlaceEditModalOpen] = useState(false); 
  const [editTimeMode, setEditTimeMode] = useState(false); // 시간 수정 모드

  const [editedPeriod, setEditedPeriod] = useState("오전"); // 오전/오후 toggle
  const [editedHour, setEditedHour] = useState(6); // Editable hour

  const [editedTime, setEditedTime] = useState(""); // 수정 중인 시간
  const [isModified, setIsModified] = useState(false); // 수정 여부 상태 추가

  const [weatherInfo, setWeatherInfo] = useState(null);
  const userId = userInfo.userId;

  const handleActivityNameChange = (e) => {
    setEditedActivityName(e.target.value);
    setIsModified(true); // 수정되었음을 표시
  };

  const handlePlaceNameChange = (newPlace) => {
    setEditedPlaceName(newPlace.place_name); // 장소명 업데이트
    setSelectedActivity((prev) => ({
      ...prev,
      placeName: newPlace.place_name, // 장소명
      address: newPlace.road_address_name || newPlace.address, // 주소
      latitude: newPlace.latitude, // 위도
      longitude: newPlace.longitude, // 경도
      timeSlot: prev.timeSlot, // 기존 시간 유지
    }));
    setSelectedPlace(newPlace); // 선택된 장소 업데이트
    setIsModified(true); // 수정되었음을 표시
    //console.log("Updated activity with new place:", newPlace);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace({
      place_name: place.place_name || "선택된 장소",
      road_address_name: place.road_address_name || place.address, // address를 사용할 경우 대비
      latitude: place.latitude, // 위도 추가
      longitude: place.longitude, // 경도 추가
    });
    setIsAntdModalOpen(false); // 장소 검색 모달 닫기
  };

  const getSchedules = () => {
    if (userId) {
      setActivities({});
      generalApiClient
        .get(`/api/schedules/${userId}`)
        .then((response) => {
          const schedules = response.data;
          const newActivities = {};
  
          schedules.forEach((schedule) => {
            const dateKey = new Date(schedule.date).toDateString();
            if (!newActivities[dateKey]) {
              newActivities[dateKey] = [];
            }
            newActivities[dateKey].push({
              id: schedule.id,
              activity: schedule.activity,
              timeSlot: schedule.timeSlot,
              placeName: schedule.placeName || "장소 정보 없음", // 장소명 추가
              address: schedule.address || "주소 정보 없음", // 주소 추가
              timestamp: schedule.timestamp || null, // timestamp 추가
            });
          });
  
          // 각 날짜별 활동들을 시간 순으로 정렬합니다.
          for (let dateKey in newActivities) {
            newActivities[dateKey].sort((a, b) => {
              return convertToDatetime(a.timeSlot) - convertToDatetime(b.timeSlot);
            });
          }
  
          setActivities(newActivities);
        })
        .catch((error) => {
          console.error("Error fetching schedules:", error);
        });
    }
  };
  
  const fetchWeatherDetails = async (userId, timestamp) => {
    try {
      const response = await generalApiClient.get("/api/schedules/weather", {
        params: { userId, timestamp }, // 요청 시 필요한 userId와 timestamp 전달
      });
      setWeatherInfo({
          ...response.data,
          temperature: parseFloat(response.data.temperature.toFixed(1)), // 소수점 1자리로 변환
      });
    } catch (error) {
      console.error("Error fetching weather details:", error);
      setWeatherInfo(null); // 에러 발생 시 null로 설정
    }
  };

  useEffect(() => {
    setMonthDates(getMonthDatesWithPlaceholders(currentMonth));
  }, [currentMonth]);

  useEffect(() => {
    if (userId) {
      getSchedules();
    }
  }, [userId]);

  useEffect(() => {
    if (!selectedPlace) {
      setEditedPlaceName(""); // 선택된 장소명이 없으면 초기화
    }
  }, [selectedPlace]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedActivity(null);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleActivityClick = (date, index) => {
    const dateString = date.toDateString();
    const selectedAct = activities[dateString][index];
    if (selectedAct) {
      setSelectedActivity({
        dateString,
        ...selectedAct,
        placeName: selectedAct.placeName || "장소 정보 없음", // 장소명 추가
        address: selectedAct.address || "주소 정보 없음", // 주소 추가
      });
      const [period, hour] = selectedAct.timeSlot.split(" ");
      setEditedPeriod(period);
      setEditedHour(parseInt(hour.replace("시", "")));
      setIsReactModalOpen(true);

      if (selectedAct.timestamp) {
        fetchWeatherDetails(userId, selectedAct.timestamp);
      } else {
        console.error("timestamp is missing in selectedAct:", selectedAct);
      }
    }
  };

  const addActivity = (activity) => {
    const activityDate = new Date(selectedDate.getTime() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
    const timestamp = new Date(`${activityDate}T${convertTo24HourFormat(selectedTime)}`);
    const kstTimestamp = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000); // UTC+9
  
    const latitude = selectedPlace?.latitude || null;
    const longitude = selectedPlace?.longitude || null;

    generalApiClient
      .post("/api/schedules", {
        userId,
        date: activityDate,
        timeSlot: selectedTime,
        activity,
        placeName: selectedPlace?.place_name || "선택된 장소 없음", // 장소명 추가
        address: selectedPlace?.road_address_name || "주소 정보 없음", // 주소 추가
        latitude, // 목적지 위도 추가
        longitude, // 목적지 경도 추가
        timestamp: kstTimestamp.toISOString(),
      })
      .then((response) => {
        console.log("Schedule added:", response.data);
        setSelectedPlace(null); // 장소 초기화
        setEditedPlaceName(""); // 편집된 장소명 초기화
        getSchedules(); // 업데이트된 활동을 불러옵니다.
        // 활동 추가 후 정렬합니다.
        setActivities((prevActivities) => {
          const updatedActivities = { ...prevActivities };
          const dateKey = selectedDate.toDateString();
  
          if (updatedActivities[dateKey]) {
            updatedActivities[dateKey].push({
              id: response.data.id,
              activity,
              timeSlot: selectedTime,
            });
  
            updatedActivities[dateKey].sort((a, b) => {
              return convertToDatetime(a.timeSlot) - convertToDatetime(b.timeSlot);
            });
          }
  
          return updatedActivities;
        });
      })
      .catch((error) => {
        // 에러 처리: 사용자에게 메시지 표시
        if (error.response && error.response.status === 400) {
            alert(error.response.data || "중복된 일정입니다. 다른 시간대를 선택해주세요.");
        } else {
            console.error("Error adding schedule:", error);
            alert("일정을 추가하는 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
  };
  

  const deleteActivity = () => {
    if (selectedActivity && selectedActivity.id) {
      generalApiClient
        .delete(`/api/schedules/${userId}/${selectedActivity.id}`)
        .then(() => {
          console.log("Schedule deleted");
          setIsReactModalOpen(false);
          setSelectedPlace(null); // 장소 초기화
          setEditedPlaceName(""); // 편집된 장소명 초기화
          getSchedules();
        })
        .catch((error) => {
          console.error("Error deleting schedule:", error);
        });
    }
  };

  const handleActivityUpdate = () => {
    if (selectedActivity && selectedActivity.id) {
      const updatedTimeSlot = `${editedPeriod} ${editedHour}시`;
  
      // 선택된 날짜와 시간을 로컬 기준으로 결합
      const localDate = new Date(selectedDate);
      localDate.setHours(...convertTo24HourFormat(updatedTimeSlot).split(":").map(Number));
  
      // KST(UTC+9)로 변환
      const kstTimestamp = new Date(localDate.getTime() + 9 * 60 * 60 * 1000);
  
      generalApiClient
        .put(`/api/schedules/${userId}/${selectedActivity.id}`, {
          activity: editedActivityName || selectedActivity.activity,
          timeSlot: updatedTimeSlot,
          placeName: editedPlaceName || selectedActivity.placeName,
          address: selectedActivity.address,
          latitude: selectedActivity.latitude || null,
          longitude: selectedActivity.longitude || null,
          timestamp: kstTimestamp.toISOString(),
        })
        .then(() => {
          console.log("Schedule updated");
          setIsReactModalOpen(false);
          setIsModified(false);
          getSchedules();
        })
        .catch((error) => {
          console.error("Error updating schedule:", error);
        });
    }
  };
  
  

  useEffect(() => {
    if (selectedActivity) {
      setEditedActivityName(selectedActivity.activity || "");
    }
  }, [selectedActivity]);

  const convertTo24HourFormat = (timeSlot) => {
    const [period, hour] = timeSlot.split(" ");
    const hourNumber = parseInt(hour.replace("시", ""));
    if (period === "오전") {
      return hourNumber < 10 ? `0${hourNumber}:00:00` : `${hourNumber}:00:00`;
    }
    return hourNumber < 12
      ? `${hourNumber + 12}:00:00`
      : `${hourNumber}:00:00`; // 12시 이상은 변환하지 않음
  };


  const convertToDatetime = (timeSlot) => {
    const [period, hour] = timeSlot.split(" ");
    const hourNumber = parseInt(hour.replace("시", ""));
    if (period === "오전") return hourNumber;
    return hourNumber + 12;
  };

  //날짜 출력 형식 바꾸기
  const formatKoreanDate = (date) => {
    return moment(date).format("YYYY년 M월 D일");
  }
  
  const formatDate = (date) => {
    const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const month = date.getMonth() + 1; // 월 (0부터 시작하므로 +1)
    const day = date.getDate(); // 일
    const weekday = days[date.getDay()]; // 요일
    return `${month}월 ${day}일 ${weekday}`;
  };

  return (
    <div className="recent-calendar-container">
      <h3 className="recent-calendar-title">일정 추가하기</h3>
      <div className="view-mode-buttons">
        <Button
          type={viewMode === "week" ? "primary" : "default"}
          onClick={() => setViewMode("week")}
        >
          주단위 보기
        </Button>
        <Button
          type={viewMode === "month" ? "primary" : "default"}
          onClick={() => setViewMode("month")}
        >
          월단위 보기
        </Button>
      </div>

      <br/>

      {viewMode === "week" ? (
        <ScrollMenu>
          {recentDates.map((date) => (
            <div
              key={date.toDateString()}
              onClick={() => handleDateClick(date)}
              className={`date-card ${
                date.toDateString() === selectedDate.toDateString()
                  ? "selected"
                  : ""
              }`}
            >
              <div className="date">
                {date.getDate()}일 (
                {date.toLocaleDateString("ko-KR", { weekday: "short" })})
              </div>
              <div className="activities">
                {activities[date.toDateString()] &&
                  activities[date.toDateString()].map((activity, index) => (
                    <div
                      key={activity.id}
                      className="activity-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(date, index);
                      }}
                    >
                      {activity.timeSlot} - {activity.activity}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </ScrollMenu>
      ) : (
        <div className="month-view-container">
          <div className="month-header">
            <Button onClick={() => handleMonthChange(-1)}>{"<"}</Button>
            <div className="current-month">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </div>
            <Button onClick={() => handleMonthChange(1)}>{">"}</Button>
          </div>
          <div className="days-of-week">
            {daysOfWeek.map((day) => (
              <div key={day} className="day-of-week">
                {day}
              </div>
            ))}
          </div>
          <div className="month-days">
              {monthDates.map((date, index) => (
                <div
                  key={index}
                  className={`month-date-card ${
                    date && date.toDateString() === selectedDate?.toDateString() ? "selected" : ""
                  } ${date ? "current-month" : "empty-date"}`}
                  onClick={() => date && setSelectedDate(date)} // 빈칸(null)은 클릭 불가
                >
                <div className="date">{date ? date.getDate() : ""}</div>
                {date && activities[date.toDateString()] && (
                  <div className="activities">
                    {activities[date.toDateString()].map((activity, idx) => (
                      <div
                        key={idx}
                        className="activity-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivityClick(date, idx);
                        }}
                      >
                        {activity.activity}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시간 선택 */}
      <br/>
      <hr/>
      <div className="time-picker-container">
        {/* <h4>{formatKoreanDate(selectedDate)} 시간대 선택</h4> */}
        <h4> <FontAwesomeIcon icon={faClock} /> {formatDate(selectedDate)} 시간대 선택</h4>
        <Timepicker onTimeSelect={handleTimeSelect} />
      </div>

      {/* 장소 선택 영역 */}
      <div>
        <h3>장소 선택</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
          <Button onClick={() => setIsAntdModalOpen(true)}>장소 검색</Button>
          <NearbySearch onPlaceSelect={handlePlaceSelect} /> {/* 독립적으로 사용 */}
        </div>

        {selectedPlace && (
          <div>
            <p>선택된 장소: {selectedPlace.place_name}</p>
            <p>({selectedPlace.road_address_name || selectedPlace.address_name})</p>
          </div>
        )}

        {/* 모달 */}
        <AntdModal
          title="장소 검색"
          visible={isAntdModalOpen}
          onCancel={() => setIsAntdModalOpen(false)} // 모달 닫기
          footer={null} // 하단 버튼 제거
        >
          <PlaceSearch onPlaceSelect={handlePlaceSelect} />
        </AntdModal>
      </div>

      {/* 활동 추가 */}
      {selectedTime && (
        <div className="activity-options">
          {/* <h4>{formatKoreanDate(selectedDate)} <br/> {selectedTime}에 추가할 활동 선택</h4> */}
          <h4>{formatDate(selectedDate)} {selectedTime}에 추가할 활동 선택</h4>
          {["등산", "산책", "스포츠"].map((activity) => (
            <button
              key={activity}
              onClick={() => addActivity(activity)}
              className="activity-button"
            >
              {activity}
            </button>
          ))}
          <button
            onClick={() => setIsActivityModalOpen(true)} // 모달 열기
            className="activity-button"
          >
            직접 추가
          </button>
        </div>
      )}

      <AntdModal
        title="활동 추가"
        visible={isActivityModalOpen}
        onCancel={() => setIsActivityModalOpen(false)} // 모달 닫기
        footer={null} // 하단 버튼 제거
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="활동명을 입력하세요"
            value={customActivity}
            onChange={(e) => setCustomActivity(e.target.value)} // 사용자 입력 저장
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              width: "100%",
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              if (customActivity.trim()) {
                addActivity(customActivity); // 사용자 입력으로 활동 추가
                setCustomActivity(""); // 입력 초기화
                setIsActivityModalOpen(false); // 모달 닫기
              }
            }}
          >
            확인
          </Button>
        </div>
      </AntdModal>

      {/* 일정 상세정보 조회/수정/삭제 모달 */}
      <ReactModal
        isOpen={isReactModalOpen}
        onRequestClose={() => isReactModalOpen(false)}
        contentLabel="Activity Details"
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
      >
        {selectedActivity && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px", // 각 항목 간 간격 추가
            }}
          >
            <h2>일정 상세정보</h2>
            <div className="time-picker-container">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>시간:</span>
                {editTimeMode ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* AM/PM Toggle Button */}
                    <button
                      onClick={() => {
                        setEditedPeriod((prev) => (prev === "오전" ? "오후" : "오전")); // Toggle AM/PM
                        setIsModified(true); // Enable "수정하기" button
                      }}
                      style={{
                        padding: "5px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        backgroundColor: "#f0f0f0",
                        cursor: "pointer",
                      }}
                    >
                      {editedPeriod}
                    </button>
                    {/* Hour Input */}
                    <input
                      type="number"
                      value={editedHour}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 빈 문자열 처리 (backspace 허용)
                        if (value === "" || (value >= 1 && value <= 12)) {
                          setEditedHour(value); // Update the hour
                          setIsModified(true); // Enable "수정하기" button
                        }
                      }}
                      style={{
                        padding: "5px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        width: "50px",
                      }}
                    />
                    시
                    <button
                      onClick={() => {
                        setSelectedActivity((prev) => ({
                          ...prev,
                          timeSlot: `${editedPeriod} ${editedHour}시`, // Apply the edited time
                        }));
                        setEditTimeMode(false); // Exit edit mode
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "1px",
                      }}
                    >
                      ✅
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>{selectedActivity.timeSlot}</span>
                    <button
                      onClick={() => {
                        const [period, hour] = selectedActivity.timeSlot.split(" ");
                        setEditedPeriod(period); // Set initial AM/PM value
                        setEditedHour(parseInt(hour.replace("시", ""))); // Set initial hour
                        setEditTimeMode(true); // Enable edit mode
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "1px",
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>


            {/* 활동명 수정 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>활동명:</span>
              {editActivityMode ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="text"
                    value={editedActivityName}
                    //onChange={(e) => setEditedActivityName(e.target.value)}
                    onChange={handleActivityNameChange}
                    style={{
                      padding: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      width: "120px", // 너비 조정
                    }}
                  />
                  <button
                    onClick={() => {
                      setSelectedActivity((prev) => ({
                        ...prev,
                        activity: editedActivityName,
                      }));
                      setEditActivityMode(false);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "1px",
                    }}
                  >
                    ✅
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>{selectedActivity.activity}</span>
                  <button
                    onClick={() => setEditActivityMode(true)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "1px",
                    }}
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>


            {/* 장소명 수정 */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>장소명:</span>
              <span>{editedPlaceName || selectedActivity.placeName}</span>
              <button
                onClick={() => setIsPlaceEditModalOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "1px",
                }}
              >
                ✏️
              </button>
            </div>
            {weatherInfo && (
                <div>
                    <span>예상 기온 및 날씨: {weatherInfo.temperature}°C  {weatherInfo.weatherCondition}</span>
                </div>
              )}

            {/* 장소 검색 모달 */}
            <AntdModal
              title="장소 검색"
              visible={isPlaceEditModalOpen}
              onCancel={() => setIsPlaceEditModalOpen(false)}
              footer={null}
            >
              <PlaceSearch
                onPlaceSelect={(place) => {
                  console.log("Selected place:", place); // place 객체 구조 확인
                  if (!place.road_address_name && !place.address) {
                    console.error("Address is missing in place object");
                    return;
                  }
                  // setSelectedActivity((prev) => ({
                  //   ...prev,
                  //   placeName: place.place_name,
                  //   address: place.road_address_name || place.address,
                  // }));
                  handlePlaceNameChange(place);
                  setIsPlaceEditModalOpen(false);
                }}
              />
            </AntdModal>
          
            <div className="modal-buttons">
              <button
                onClick={handleActivityUpdate}
                disabled={!isModified} // 수정 여부에 따라 활성화/비활성화
                style={{
                  backgroundColor: isModified ? "#1890ff" : "#ccc",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  cursor: isModified ? "pointer" : "not-allowed",
                }}
              >
                수정하기
              </button>

              <button
                onClick={() => setIsReactModalOpen(false)}
                className="cancel-button"
              >
                확인
              </button>
            </div>
            <button onClick={deleteActivity} className="delete-modal-button">
              삭제하기
            </button>
          </div>
        )}
      </ReactModal>
    </div>
  );
};

export default RecentCalendar;
