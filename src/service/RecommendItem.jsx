import React from "react";
import umbrellaImg from "/src/assets/images/umbrella1.png";
import maskImg from "/src/assets/images/mask.png";
import sunglassesImg from "/src/assets/images/sunglasses.png";
import rainyIcon from "/src/icon/rainy.png";
import snowIcon from "/src/icon/snow.png";
import "./RecommendItem.css";

function RecommendItem() {
  // Mock 데이터: 향후 12시간 동안 강수 확률, 강수량, 강설량 및 미세먼지 농도 가정
  const mockHourlyData = [
    { time: "오전 9시", temp: 15, precipitation: 20, rain: 0, snow: 0 },
    { time: "오전 10시", temp: 16, precipitation: 0, rain: 0, snow: 0 },
    { time: "오전 11시", temp: 18, precipitation: 0, rain: 0, snow: 0 },
    { time: "오후 12시", temp: 19, precipitation: 0, rain: 0, snow: 0 },
    { time: "오후 1시", temp: 20, precipitation: 2, rain: 0, snow: 0 },
    { time: "오후 2시", temp: 21, precipitation: 2, rain: 0, snow: 0 },
    { time: "오후 3시", temp: 21, precipitation: 2, rain: 0, snow: 0 },
    { time: "오후 4시", temp: 21, precipitation: 2, rain: 0, snow: 0 },
    { time: "오후 5시", temp: 21, precipitation: 0, rain: 0, snow: 0 },
    // 나머지 시간 데이터 추가
  ];

  const airQualityData = {
    pm2_5: 21, // PM2.5 농도 (기준: 35 이상이면 나쁨)
    pm10: 20, // PM10 농도 (기준: 50 이상이면 나쁨)
  };

  const uvIndex = 2; // 자외선 지수 (기준: 6 이상이면 높음)

  const recommendations = [];

  console.log("RecItem weather", mockHourlyData);

  // 향후 12시간 동안의 데이터를 기반으로 우산 추천 여부 결정
  const next12Hours = mockHourlyData.slice(0, 12);
  const hasRain = next12Hours.some(hour => hour.rain > 0);
  const hasSnow = next12Hours.some(hour => hour.snow > 0);

  // 우산 추천 추가 (비나 눈이 올 경우에만)
  if (hasRain || hasSnow) {
    recommendations.push({ name: "우산", imageUrl: umbrellaImg });
  }

  // 미세먼지 농도가 높은 경우 마스크 추천 추가 (나쁨 이상일 때)
  if (airQualityData.pm2_5 > 35 || airQualityData.pm10 > 50) {
    recommendations.push({ name: "마스크", imageUrl: maskImg });
  }

  // 자외선 지수가 높은 경우 선글라스 추천 추가 (지수 6 이상일 때)
  if (uvIndex >= 6) {
    recommendations.push({ name: "선글라스", imageUrl: sunglassesImg });
  }

  // 미세먼지 상태 계산
  const airQualityStatus =
    airQualityData.pm2_5 > 75 || airQualityData.pm10 > 100
      ? "매우 나쁨"
      : airQualityData.pm2_5 > 35 || airQualityData.pm10 > 50
      ? "나쁨"
      : "보통";

  // 비나 눈이 올 경우의 상세 정보 수집
  const highRainPeriods = [];
  let currentPeriod = null;

  next12Hours.forEach((hour, index) => {
    if (hour.rain > 0 || hour.snow > 0) {
      if (!currentPeriod) {
        currentPeriod = {
          startTime: hour.time,
          endTime: hour.time,
          maxPrecipitation: hour.precipitation,
          minRain: hour.rain,
          maxRain: hour.rain,
          minSnow: hour.snow,
          maxSnow: hour.snow,
        };
      } else {
        currentPeriod.endTime = hour.time;
        currentPeriod.maxPrecipitation = Math.max(currentPeriod.maxPrecipitation, hour.precipitation);
        currentPeriod.minRain = Math.min(currentPeriod.minRain, hour.rain);
        currentPeriod.maxRain = Math.max(currentPeriod.maxRain, hour.rain);
        currentPeriod.minSnow = Math.min(currentPeriod.minSnow, hour.snow);
        currentPeriod.maxSnow = Math.max(currentPeriod.maxSnow, hour.snow);
      }
    } else if (currentPeriod) {
      highRainPeriods.push(currentPeriod);
      currentPeriod = null;
    }
  });
  if (currentPeriod) {
    highRainPeriods.push(currentPeriod);
  }

  return (
    <div className="recommendation-container">
      {/* 자외선 지수가 높은 경우 멘트 표시 */}
      {uvIndex >= 6 && (
        <div className="uv-protection-info" style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <h3>눈 건강을 위해 자외선을 차단하세요</h3>
        </div>
      )}
      <div className="rain-details-left">
        {highRainPeriods.length > 0 && (
          <table className="rain-details-table custom-table">
            <tbody>
              {highRainPeriods.map((period, idx) => (
                <React.Fragment key={idx}>
                  <tr className="rain-detail-item">
                    <td rowSpan="2" className="icon-cell">
                      {period.maxSnow > 0 ? (
                        <img src={snowIcon} alt="snow icon" className="snow-icon" />
                      ) : (
                        <img src={rainyIcon} alt="rainy icon" className="rain-icon" />
                      )}
                    </td>
                    <td className="time-cell" colSpan="2">{period.startTime} ~ {period.endTime}</td>
                  </tr>
                  <tr className="rain-detail-item">
                    <td className="precipitation-cell">{period.maxPrecipitation}%</td>
                    <td className="rainfall-cell">
                      {/* 비와 눈의 최대, 최소 값을 함께 표시 */}
                      {period.maxRain > 0 && (
                        <>
                          {period.minRain !== period.maxRain
                            ? `${period.minRain} ~ ${period.maxRain}`
                            : `${period.minRain}`} mm
                          <br />
                        </>
                      )}
                      {period.maxSnow > 0 && (
                        <>
                          {period.minSnow !== period.maxSnow
                            ? `${period.minSnow} ~ ${period.maxSnow}`
                            : `${period.minSnow}`} mm
                        </>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="recommendations-right">
        <h3>추천 준비물</h3>
        {recommendations.length > 0 ? (
          <ul className="recommendation-list">
            {recommendations.map((item, index) => (
              <li key={index} className="recommendation-item">
                <img src={item.imageUrl} alt={item.name} />
                <div className="recommendation-details">
                  <span>{item.name}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>외출 준비물 없음</p> // 강수량과 강설량이 0일 경우 준비물이 없음을 표시
        )}
      </div>
    </div>
  );
}

export default RecommendItem;
