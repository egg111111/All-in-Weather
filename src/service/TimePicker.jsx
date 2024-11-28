import React, { useState, useRef, useEffect } from "react";

const TimePicker = ({ onTimeSelect }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
  const repeatedHours = [...hours, ...hours, ...hours]; // 시간을 반복하여 스크롤의 원형 효과를 줌
  const [amPm, setAmPm] = useState("오전");
  const [selectedHour, setSelectedHour] = useState(1);
  const scrollRef = useRef();

  // 초기 스크롤 위치를 중앙으로 설정하여 중간에서 시작하도록 함
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (repeatedHours.length / 3) * 40; // 초기 스크롤 위치 설정
    }
  }, []);

  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    const totalHeight = repeatedHours.length * 40;
    const hourIndex = Math.round(scrollTop / 40) % 12;

    // 스크롤이 맨 위 또는 맨 아래로 갔을 때 중앙으로 이동
    if (scrollTop <= 40) {
      event.target.scrollTop = scrollTop + hours.length * 40;
    } else if (scrollTop >= totalHeight - hours.length * 40) {
      event.target.scrollTop = scrollTop - hours.length * 40;
    }

    setSelectedHour(hours[hourIndex]);
    onTimeSelect && onTimeSelect(`${amPm} ${hours[hourIndex]}시`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        margin: "20px",
        gap: "20px",
      }}
    >
      {/* 오전/오후 버튼 세로 배치 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column", // 세로 방향 배치
          alignItems: "flex-start", // 버튼을 좌측 정렬
          textAlign: "left",
        }}
      >
        <button
          onClick={() => setAmPm("오전")}
          style={{
            backgroundColor: amPm === "오전" ? "#007bff" : "#d1d0d0dc",
            color: amPm === "오전" ? "white" : "black",
            padding: "10px 20px",
            marginBottom: "10px",
            border: "none",
            borderRadius: "5px",
            fontWeight: amPm === "오전" ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          오전
        </button>
        <button
          onClick={() => setAmPm("오후")}
          style={{
            backgroundColor: amPm === "오후" ? "#007bff" : "#d1d0d0dc",
            color: amPm === "오후" ? "white" : "black",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            fontWeight: amPm === "오후" ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          오후
        </button>
      </div>

      {/* 시간 선택 스크롤 */}
      <div
        ref={scrollRef}
        style={{
          height: "160px",
          overflowY: "scroll",
          border: "1px solid #ddd",
          borderRadius: "5px",
          width: "100px",
          textAlign: "center",
        }}
        onScroll={handleScroll}
      >
        {repeatedHours.map((hour, index) => (
          <div
            key={index}
            style={{
              height: "40px",
              lineHeight: "40px",
              fontSize: "18px",
              backgroundColor: selectedHour === hour ? "#007bff" : "white",
              color: selectedHour === hour ? "white" : "black",
              fontWeight: selectedHour === hour ? "bold" : "normal",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedHour(hour);
              onTimeSelect && onTimeSelect(`${amPm} ${hour}시`);
            }}
          >
            {hour}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimePicker;
