import React from "react";
import umbrellaImg from "/src/assets/images/umbrella1.png";
import maskImg from "/src/assets/images/mask.png";
import sunglassesImg from "/src/assets/images/sunglasses.png";
import rainyIcon from "/src/assets/icon/rainy.png";
import snowIcon from "/src/assets/icon/snow.png";
import "./RecommendItem.css";

function RecommendItem({ hourlyData, airPollData, uvIndex }) {
  const recommendations = [];

  // 향후 12시간 동안의 데이터를 기반으로 우산 추천 여부 결정
  const next12Hours = hourlyData.slice(0, 12);
  const hasRain = next12Hours.some(hour => hour.rain > 0);
  const hasSnow = next12Hours.some(hour => hour.snow > 0);

  // 우산 추천 추가 (비나 눈이 올 경우에만)
  if (hasRain || hasSnow) {
    recommendations.push({ name: "우산", imageUrl: umbrellaImg });
  }

  // 미세먼지 농도가 높은 경우 마스크 추천 추가 (나쁨 이상일 때)
  if (airPollData && (airPollData.pm2_5 > 35 || airPollData.pm10 > 50)) {
    recommendations.push({ name: "마스크", imageUrl: maskImg });
  }

  // 자외선 지수가 높은 경우 선글라스 추천 추가 (지수 6 이상일 때)
  if (uvIndex >= 6) {
    recommendations.push({ name: "선글라스", imageUrl: sunglassesImg });
  }

  // 요일 축약형 배열
  const weekdaysShort = ["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"];

  // 비나 눈이 올 경우의 상세 정보 수집
  const highRainPeriods = [];
  let currentPeriod = null;

  next12Hours.forEach((hour, index) => {
    if (hour.rain > 0 || hour.snow > 0) {
      const day = weekdaysShort[hour.date.getDay()]; // 요일 정보 가져오기

      if (!currentPeriod) {
        currentPeriod = {
          startTime: `${day} ${hour.time}`, // 요일 축약형 추가
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
                    <td className="time-cell" colSpan="2">
                      {period.startTime} ~ {period.endTime}
                    </td>
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
                <img className="recommendation-imgs" src={item.imageUrl} alt={item.name} />
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
