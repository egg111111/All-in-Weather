import React, { useState, useEffect } from 'react';
import './RecentCalendar.css'; // 스타일링 파일
import generalApiClient from '../service/generalApiClient';
import Modal from 'react-modal';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';

Modal.setAppElement('#root');

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
    const [activities, setActivities] = useState({});
    const [selectedActivity, setSelectedActivity] = useState({ dateString: null, index: null });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getSchedules = () => {
        if (userId) {
            generalApiClient.get(`/api/schedules/${userId}`)
                .then(response => {
                    const schedules = response.data;
                    const newActivities = {};

                    schedules.forEach(schedule => {
                        const dateKey = new Date(schedule.date).toDateString();
                        if (!newActivities[dateKey]) {
                            newActivities[dateKey] = [];
                        }
                        newActivities[dateKey].push({
                            id: schedule.id,
                            activity: schedule.activity
                        });
                    });

                    setActivities(newActivities);
                })
                .catch(error => {
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
        setSelectedActivity({ dateString: null, index: null });
    };

    const addActivity = (activity) => {
        const activityDate = selectedDate.toISOString().split('T')[0]; // 선택한 날짜
        const convertedTimeSlot = convertTo24HourFormat(selectedTimeSlot); // 시간대를 변환
    
        // 선택한 날짜와 시간대를 조합하여 타임스탬프 생성
        const timestampString = `${activityDate}T${convertedTimeSlot}`;
        let timestamp = new Date(timestampString);
    
        // 타임스탬프가 유효한지 확인
        if (isNaN(timestamp.getTime())) {
            console.error("유효하지 않은 타임스탬프입니다:", timestampString);
            return;
        }
    
        // KST 시간으로 변환 (UTC+9)
        const kstOffset = 9 * 60 * 60 * 1000; // 9시간(밀리초 단위)
        timestamp = new Date(timestamp.getTime() + kstOffset);
    
        generalApiClient.post('/api/schedules', {
            userId,
            date: activityDate,
            timeSlot: selectedTimeSlot,
            activity,
            timestamp: timestamp.toISOString() // KST로 변환된 시간을 문자열로 변환
        }).then(response => {
            console.log('Schedule saved:', response.data);
            getSchedules(); // 일정 목록 갱신
        }).catch(error => {
            console.error('Error saving schedule:', error);
        });
    };
    
    const convertTo24HourFormat = (timeSlot) => {
        const timeSlotMap = {
            "오전 6시": "06:00:00",
            "오전 9시": "09:00:00",
            "오후 12시": "12:00:00",
            "오후 3시": "15:00:00",
            "오후 6시": "18:00:00",
            "오후 9시": "21:00:00"
        };
    
        return timeSlotMap[timeSlot] || "00:00:00"; // 기본값 설정
    };
    
    

    

    const deleteActivity = (date, activityIndex) => {
        const dateString = date.toDateString();
        const activityToDelete = activities[dateString][activityIndex];

        if (activityToDelete && activityToDelete.id) {
            generalApiClient.delete(`/api/schedules/${userId}/${activityToDelete.id}`)
                .then(response => {
                    console.log('Schedule deleted:', response.data);
                    getSchedules();
                }).catch(error => {
                    console.error('Error deleting schedule:', error);
                });
        } else {
            console.error('Invalid activity ID for deletion.');
        }
    };

    const editActivity = (date, activityIndex) => {
        setIsModalOpen(true);
        setSelectedActivity({ dateString: date.toDateString(), index: activityIndex });
    };

    const handleActivityUpdate = (newActivity) => {
        const dateString = selectedActivity.dateString;
        const activityToEdit = activities[dateString][selectedActivity.index];
        if (activityToEdit) {
            generalApiClient.put(`/api/schedules/${userId}/${activityToEdit.id}`, {
                activity: newActivity
            }).then(response => {
                console.log('Schedule updated:', response.data);
                setIsModalOpen(false);
                getSchedules();
            }).catch(error => {
                console.error('Error updating schedule:', error);
            });
        }
    };

    const handleActivityClick = (date, index) => {
        const dateString = date.toDateString();
        if (selectedActivity.dateString === dateString && selectedActivity.index === index) {
            setSelectedActivity({ dateString: null, index: null });
        } else {
            setSelectedActivity({ dateString, index });
        }
    };

    const timeSlots = [
        '오전 6시', '오전 9시', '오후 12시', '오후 3시', '오후 6시', '오후 9시'
    ];
    
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    
    // 시간대 선택 핸들러
    const handleTimeSlotClick = (timeSlot) => {
        setSelectedTimeSlot(timeSlot);
    };

    return (
        <div className="recent-calendar-container">
            <h3>최근 7일의 일정 추가하기</h3>
            <ScrollMenu>
                {recentDates.map((date) => (
                    <div
                        key={date.toDateString()}
                        onClick={() => handleDateClick(date)}
                        className={`date-card ${date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                    >
                        <div className="date">
                            {date.getDate()}일 ({date.toLocaleDateString('ko-KR', { weekday: 'short' })})
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
                                        {activity.activity}
                                        {selectedActivity.dateString === date.toDateString() &&
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
                                                        editActivity(date, index);
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
            {/* 시간대 선택 추가 */}
            <div className="time-slot-options">
                <h4>{selectedDate.toDateString()}에 시간대 선택</h4>
                {timeSlots.map((timeSlot) => (
                    <button
                        key={timeSlot}
                        onClick={() => handleTimeSlotClick(timeSlot)}
                        className={timeSlot === selectedTimeSlot ? 'selected' : ''}
                    >
                        {timeSlot}
                    </button>
                ))}
            </div>

            {/* 활동 추가 버튼 */}
            {selectedTimeSlot && (
                <div className="activity-options">
                    <h4>{selectedDate.toDateString()} {selectedTimeSlot}에 활동 추가</h4>
                    {['등산', '산책', '스포츠'].map((activity) => (
                        <button key={activity} onClick={() => addActivity(activity)}>
                            {activity}
                        </button>
                    ))}
                </div>
            )}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Edit Activity"
                className="react-modal-content"
                overlayClassName="react-modal-overlay"
            >
                <h2>활동 수정하기</h2>
                <div className="modal-buttons">
                    {['등산', '산책'].map((newActivity) => (
                        <button key={newActivity} onClick={() => handleActivityUpdate(newActivity)} className="edit-activity-button">
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
