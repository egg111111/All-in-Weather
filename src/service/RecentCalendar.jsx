import React, { useState, useEffect } from "react";
import "./RecentCalendar.css";
import generalApiClient from "../service/generalApiClient";
import Modal from "react-modal";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
import "react-horizontal-scrolling-menu/dist/styles.css";
import TimePicker from "./TimePicker";

Modal.setAppElement("#root");

const RecentCalendar = ({ userData }) => {
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

  const recentDates = getRecentDates();
  const userId = userData.userId;

  const [selectedDate, setSelectedDate] = useState(recentDates[0]);
  const [selectedTime, setSelectedTime] = useState(null); // TimePicker 선택 시간
  const [activities, setActivities] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null); // 수정할 활동
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedActivity(null);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setSelectedActivity(null);
  };

  const handleActivityClick = (date, index) => {
    const dateString = date.toDateString();
    if (
      selectedActivity &&
      selectedActivity.dateString === dateString &&
      selectedActivity.index === index
    ) {
      setSelectedActivity(null); // 활동을 다시 클릭하면 선택 해제
    } else {
      setSelectedActivity({ dateString, index }); // 활동 선택
      // 활동을 선택할 때, 해당 활동의 시간을 `selectedTime`에 설정합니다.
      const selectedAct = activities[dateString][index];
      if (selectedAct) {
        setSelectedTime(selectedAct.timeSlot);
      }
    }
  };

  const addActivity = (activity) => {
    const activityDate = selectedDate.toISOString().split("T")[0];
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
        getSchedules();
      })
      .catch((error) => {
        console.error("Error adding schedule:", error);
      });
  };

  const deleteActivity = (date, activityIndex) => {
    const dateString = date.toDateString();
    const activityToDelete = activities[dateString][activityIndex];

    if (activityToDelete && activityToDelete.id) {
      generalApiClient
        .delete(`/api/schedules/${userId}/${activityToDelete.id}`)
        .then(() => {
          console.log("Schedule deleted");
          getSchedules();
        })
        .catch((error) => {
          console.error("Error deleting schedule:", error);
        });
    }
  };

  const handleActivityUpdate = (newActivity) => {
    if (selectedActivity) {
      const dateString = selectedActivity.dateString;
      const activityToEdit = activities[dateString][selectedActivity.index];
      if (!selectedTime) {
        console.error("No valid time selected for updating the schedule.");
        return;
      }
      const activityDate = selectedDate.toISOString().split("T")[0];
      const timestamp = new Date(`${activityDate}T${convertTo24HourFormat(selectedTime)}`);
      const kstTimestamp = new Date(timestamp.getTime() + 9 * 60 * 60 * 1000);
  
      generalApiClient
        .put(`/api/schedules/${userId}/${activityToEdit.id}`, {
          activity: newActivity,
          timeSlot: selectedTime,
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


  const convertTo24HourFormat = (timeSlot) => {
    const [period, hour] = timeSlot.split(" ");
    const hourNumber = parseInt(hour.replace("시", ""));
    if (period === "오전") return hourNumber < 10 ? `0${hourNumber}:00:00` : `${hourNumber}:00:00`;
    return hourNumber < 12 ? `${hourNumber + 12}:00:00` : `${hourNumber}:00:00`;
  };

  return (
    <div className="recent-calendar-container">
      <h3>최근 7일의 일정 추가하기</h3>
      <ScrollMenu>
        {recentDates.map((date) => (
          <div
            key={date.toDateString()}
            onClick={() => handleDateClick(date)}
            className={`date-card ${date.toDateString() === selectedDate.toDateString() ? "selected" : ""}`}
          >
            <div className="date">
              {date.getDate()}일 ({date.toLocaleDateString("ko-KR", { weekday: "short" })})
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
                    {selectedActivity &&
                      selectedActivity.dateString === date.toDateString() &&
                      selectedActivity.index === index && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteActivity(date, index);
                            }}
                            className="delete-button"
                          >
                            X
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsModalOpen(true);
                              setSelectedActivity({ dateString: date.toDateString(), index });
                            }}
                            className="edit-button"
                          >
                            ✏️
                          </button>
                        </>
                      )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </ScrollMenu>

      {/* 시간 선택 */}
      <div className="time-picker-container">
        <h4>{selectedDate.toDateString()}에 시간대 선택</h4>
        <TimePicker onTimeSelect={handleTimeSelect} />
      </div>

      {/* 활동 추가 */}
      {selectedTime && (
        <div className="activity-options">
          <h4>{selectedDate.toDateString()} {selectedTime}에 추가할 활동 선택</h4>
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
        contentLabel="Edit Activity"
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
      >
        <h2>활동 수정하기</h2>
        <div className="modal-buttons">
          {["등산", "산책", "스포츠"].map((newActivity) => (
            <button
              key={newActivity}
              onClick={() => handleActivityUpdate(newActivity)}
              className="edit-activity-button"
            >
              {newActivity}
            </button>
          ))}
        </div>
        <button onClick={() => setIsModalOpen(false)} className="cancel-button">취소</button>
      </Modal>
    </div>
  );
};

export default RecentCalendar;
