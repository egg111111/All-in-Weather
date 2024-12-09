import React, { useState, useEffect } from "react";
import "./RecentCalendar.css";
import generalApiClient from "../service/generalApiClient";
import Modal from "react-modal";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import Timepicker from "./TimePicker";
import { Button, TimePicker } from "antd"; // TimePicker 추가
import moment from "moment"; // 추가
import "moment/locale/ko"; // 한국어 로케일 추가
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setTitle } from "../reducers/titleSlice.js";

//아이콘 추가 임포트
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";


moment.locale("ko"); // moment의 로케일을 한국어로 설정
Modal.setAppElement("#root");

const RecentCalendar = () => {
  const location = useLocation();
  const { userInfo } = location.state || {};

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
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  };

  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
    setMonthDates(getMonthDates(newMonth));
  };

  const recentDates = getRecentDates();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthDates, setMonthDates] = useState(getMonthDates(currentMonth));
  const [selectedDate, setSelectedDate] = useState(recentDates[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [activities, setActivities] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("week");
  const userId = userInfo.userId;

  const getSchedules = () => {
    if (userId) {
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
  

  useEffect(() => {
    if (userId) {
      getSchedules();
    }
  }, [userId]);

  useEffect(() => {
    setMonthDates(getMonthDates(currentMonth));
  }, [currentMonth]);

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
      });
      setIsModalOpen(true);
    }
  };

  const addActivity = (activity) => {
    const activityDate = new Date(selectedDate.getTime() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
    const timestamp = new Date(`${activityDate}T${convertTo24HourFormat(selectedTime)}`);
    const kstTimestamp = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000); // UTC+9
  
    generalApiClient
      .post("/api/schedules", {
        userId,
        date: activityDate,
        timeSlot: selectedTime,
        activity,
        timestamp: kstTimestamp.toISOString(),
      })
      .then((response) => {
        console.log("Schedule added:", response.data);
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
        console.error("Error adding schedule:", error);
      });
  };
  

  const deleteActivity = () => {
    if (selectedActivity && selectedActivity.id) {
      generalApiClient
        .delete(`/api/schedules/${userId}/${selectedActivity.id}`)
        .then(() => {
          console.log("Schedule deleted");
          setIsModalOpen(false);
          getSchedules();
        })
        .catch((error) => {
          console.error("Error deleting schedule:", error);
        });
    }
  };

  const handleActivityUpdate = () => {
    if (selectedActivity && selectedActivity.id) {
      const timestamp = new Date(
        `${selectedDate.toISOString().split("T")[0]}T${convertTo24HourFormat(
          selectedActivity.timeSlot
        )}`
      );
      const kstTimestamp = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000);

      generalApiClient
        .put(`/api/schedules/${userId}/${selectedActivity.id}`, {
          activity: selectedActivity.activity,
          timeSlot: selectedActivity.timeSlot,
          timestamp: kstTimestamp.toISOString(),
        })
        .then(() => {
          console.log("Schedule updated");
          setIsModalOpen(false);
          getSchedules();
        })
        .catch((error) => {
          console.error("Error updating schedule:", error);
        });
    }
  };


  const convertToKoreanTimeFormat = (timeString) => {
    const [period, hour] = timeString.split(" ");
    const hourNumber = parseInt(hour.replace("시", ""));
    return period === "AM" ? `오전 ${hourNumber}시` : `오후 ${hourNumber}시`;
  };

  const convertTo24HourFormat = (timeSlot) => {
    const [period, hour] = timeSlot.split(" ");
    const hourNumber = parseInt(hour.replace("시", ""));
    if (period === "오전")
      return hourNumber < 10 ? `0${hourNumber}:00:00` : `${hourNumber}:00:00`;
    return hourNumber < 12
      ? `${hourNumber + 12}:00:00`
      : `${hourNumber}:00:00`;
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
                onClick={() => date && setSelectedDate(date)}
                className={`month-date-card ${
                  date && date.toDateString() === selectedDate.toDateString()
                    ? "selected"
                    : ""
                }`}
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
        <h4><FontAwesomeIcon icon={faClock} /> {formatKoreanDate(selectedDate)} 시간대 선택</h4>
        <Timepicker onTimeSelect={handleTimeSelect} />
      </div>

      {/* 활동 추가 */}
      {selectedTime && (
        <div className="activity-options">
          <h4>{formatKoreanDate(selectedDate)} <br/> {selectedTime}에 추가할 활동 선택</h4>
          {["등산", "산책", "스포츠"].map((activity) => (
            <button
              key={activity}
              onClick={() => addActivity(activity)}
              className="activity-button"
            >
              {activity}
            </button>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Activity Details"
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
      >
        {selectedActivity && (
          <div>
            <h2>일정 상세정보</h2>
            <div className="time-picker-container">
              <p>시간:</p>
              <TimePicker
                value={moment(selectedActivity.timeSlot, "A h시")} // 시간 값을 selectedTime으로 변경
                format="A h시"
                onChange={(time, timeString) => {
                  if (time && timeString) {
                    // 시간이 변경될 때 상태 업데이트 (한국어로 변환)
                    console.log("TimePicker value:", moment(selectedActivity.timeSlot, "A h시"));
                    const koreanTimeString = convertToKoreanTimeFormat(timeString);
                    console.log("변경된 시간:", koreanTimeString); // 변환된 시간 값 확인
                    setSelectedActivity((prev) => ({
                      ...prev,
                      timeSlot: koreanTimeString,
                    }));
                  } else {
                    console.log("시간 변경 실패. time 또는 timeString이 유효하지 않습니다.");
                  }
                }}
              />
            </div>
            <p>활동명: {selectedActivity.activity}</p>
            <div className="modal-buttons">
              <button
                onClick={handleActivityUpdate}
                className="edit-activity-button"
              >
                수정하기
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
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
      </Modal>
    </div>
  );
};

export default RecentCalendar;
