import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './AddUserInfo.css';
import jwt_decode from 'jwt-decode';


const AddUserInfo = () => {
  const [age, setAge] = useState(20);
  const [isAgeWheelEnabled, setIsAgeWheelEnabled] = useState(false);
  const [gender, setGender] = useState(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));  // 기본 userId
  const [isSocialLogin, setIsSocialLogin] = useState(false);  // 소셜 로그인 여부 상태 관리
  const [socialUserId, setSocialUserId] = useState(null);  // 소셜 로그인 시 userId 저장
  const [isSocialUserComplete, setIsSocialUserComplete] = useState(false);  // 추가 정보 완료 여부
  const navigate = useNavigate();

  // 소셜 로그인 여부 확인 및 userId 업데이트
  useEffect(() => {
    // 소셜 로그인 사용자의 정보 가져오기
    axios
      .get('http://localhost:8080/api/users/social_user', { withCredentials: true })
      .then(response => {
        const social_userId = response.data.social_userId;
        console.log("social_userId 출력", social_userId);
        if (social_userId) {
          // 소셜 로그인 사용자일 경우
          setIsSocialLogin(true);
          localStorage.setItem('social_userId', social_userId);  // 로컬 스토리지에 소셜 로그인 사용자 ID 저장
          setSocialUserId(social_userId);  // 상태로 소셜 로그인 사용자 ID 설정
          //setIsSocialUserComplete(isSocialUserComplete);  // 추가 정보 완료 여부 설정
          console.log("추가정보를 이미 입력한 소셜로그인 사용자 입니까? ",isSocialUserComplete);
        }
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('Authorization='));
        const token = tokenCookie ? tokenCookie.split('=')[1] : null;

        if (token) {
          try {
            // JWT 토큰을 디코딩
            const decodedToken = jwt_decode(token);
            const profileComplete = decodedToken.profileComplete;

            console.log("Profile complete status from token:", profileComplete);
            setIsSocialUserComplete(profileComplete); // 상태 업데이트
          } catch (error) {
            console.error("Error decoding JWT token:", error);
          }
        } else {
          console.warn("Authorization token not found in cookies.");
        }
      })
      .catch(error => {
        console.error("Error fetching social user info:", error);
      });
  }, []); // 컴포넌트 최초 렌더링 시 한 번만 실행

  // 나이 변경 핸들러
  const handleAgeChange = (e) => {
    let newAge = parseInt(e.target.value);
    if (newAge < 10) newAge = 10;
    if (newAge > 80) newAge = 80;
    setAge(newAge);
  };

  // 마우스 휠로 나이 변경
  const handleAgeWheel = (e) => {
    if (isAgeWheelEnabled) {
      if (e.deltaY < 0 && age < 80) {
        setAge((prevAge) => prevAge + 1);
      } else if (e.deltaY > 0 && age > 10) {
        setAge((prevAge) => prevAge - 1);
      }
    }
  };

  // 회원가입 버튼 클릭 시
  const handleSubmit = async () => {
    // 유효성 검사
    if (!gender) {
      alert('성별을 선택해주세요.');
      return;
    }
    if (!height || !weight) {
      alert('키와 몸무게를 입력해주세요.');
      return;
    }
  
    // 추가 사용자 정보 객체 생성
    const userInfo = {
      age,
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
    };
  
    try {
      let response;
  
      // 소셜 로그인 전용 API 요청
      if (isSocialLogin && !isSocialUserComplete) {
        response = await fetch(`http://localhost:8080/api/users/addUserInfo/${socialUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키를 포함하여 전송
          body: JSON.stringify(userInfo),
        });
  
        if (response.ok) {
          // 소셜 로그인 정보 업데이트 후 userId 초기화
          setIsSocialLogin(false); // 소셜 로그인 상태 false로 변경
        }
  
      } else {
        // 일반 로그인 전용 API 요청 (JWT 토큰 포함)
        const token = localStorage.getItem('token'); // JWT 토큰 가져오기
        response = await fetch(`http://localhost:8080/api/users/addUserInfo/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userInfo),
        });
      }
  
      if (response.ok) {  // 200번대 응답 확인       
        localStorage.setItem('gender', gender);
        navigate('/preference_check');
      
      } else {
        throw new Error('추가정보 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('추가정보 저장 실패:', error);
      alert(error.message); // 오류 메시지 출력
    }
  };

  return (
    <div className="extra-info-form">
      {/* 나이 입력 */}
      <div className="form-group">
        <label>나이</label>
        <div className="age-input-group">
          <input
            type="number"
            value={age}
            min="10"
            max="80"
            onChange={handleAgeChange}
            onWheel={handleAgeWheel}
          />
          <label>
            <input
              type="checkbox"
              checked={isAgeWheelEnabled}
              onChange={() => setIsAgeWheelEnabled(!isAgeWheelEnabled)}
            />
            마우스 휠 사용
          </label>
        </div>
      </div>

      {/* 성별 선택 */}
      <div className="form-group">
        <label>성별</label>
        <div className="gender-buttons">
          <button
            className={gender === 'male' ? 'active' : ''}
            onClick={() => setGender('male')}
          >
            남자
          </button>
          <button
            className={gender === 'female' ? 'active' : ''}
            onClick={() => setGender('female')}
          >
            여자
          </button>
        </div>
      </div>

      {/* 키와 몸무게 입력 */}
      <div className="form-group">
        <label>키와 몸무게</label>
        <div className="height-weight-group">
          <input
            type="number"
            placeholder="키 (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <input
            type="number"
            placeholder="몸무게 (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      {/* 회원가입 버튼 */}
      <button type="button" onClick={handleSubmit}>
        다음
      </button>
    </div>
  );
};

export default AddUserInfo;
