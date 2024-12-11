import React, { useState, useRef, useEffect } from "react";

const TimePicker = ({ onTimeSelect }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
  const repeatedHours = [...hours, ...hours, ...hours]; // 무한 스크롤용
  const [amPm, setAmPm] = useState("오전");
  const [selectedHour, setSelectedHour] = useState(1);
  const scrollRef = useRef(null);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (repeatedHours.length / 3) * 40; // 초기 중앙 위치로 스크롤
    }
  }, []);

  // 스크롤 이벤트 처리
  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    const itemHeight = 40; // 각 시간 아이템의 높이
    const totalHeight = repeatedHours.length * itemHeight;

    // 현재 선택된 시간 계산
    const index = Math.round(scrollTop / itemHeight) % 12; // 0~11
    const newHour = hours[index < 0 ? index + 12 : index]; // 음수 인덱스 보정

    // 무한 스크롤 중앙 유지
    if (scrollTop < itemHeight * hours.length) {
      event.target.scrollTop = scrollTop + hours.length * itemHeight;
    } else if (scrollTop > totalHeight - itemHeight * hours.length) {
      event.target.scrollTop = scrollTop - hours.length * itemHeight;
    }

    setSelectedHour(newHour);
    onTimeSelect && onTimeSelect(`${amPm} ${newHour}시`);
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
      {/* 오전/오후 버튼 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
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

      {/* 시간 스크롤 */}
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
