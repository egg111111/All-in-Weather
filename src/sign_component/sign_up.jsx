import React, { useRef, useState } from 'react';
<<<<<<< HEAD
import InputBox from "./InputBox";
=======
import InputBox from './inputbox';
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './sign_up.module.css';
import './style.css';
<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL;
=======
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd

export default function SignUp() {
  const idRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordCheckRef = useRef(null);
  const emailRef = useRef(null);
  const verificationCodeRef = useRef(null); // 인증 코드 입력을 위한 ref 추가

<<<<<<< HEAD
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // 인증 코드 상태 추가
=======
export default function SignUp() {
  const idRef = useRef(null);
  const passwordRef = useRef(null);
  const passwordCheckRef = useRef(null);
  const emailRef = useRef(null);
  const verificationCodeRef = useRef(null); // 인증 코드 입력을 위한 ref 추가
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd

  const [isIdError, setIsIdError] = useState(false);
  const [isPasswordError, setPasswordError] = useState(false);
  const [isPasswordCheckError, setPasswordCheckError] = useState(false);
  const [isEmailError, setEmailError] = useState(false);
  const [isVerificationError, setVerificationError] = useState(false); // 인증 코드 오류 상태 추가

<<<<<<< HEAD
  const [idMessage, setIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordCheckMessage, setPasswordCheckMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState(''); // 인증 메시지 상태 추가
=======
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // 인증 코드 상태 추가
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd

  const [isIdCheck, setIdCheck] = useState(false);
  const [isEmailCheck, setEmailCheck] = useState(false);

<<<<<<< HEAD
  const signUpButtonClass = id && password && passwordCheck && email ? 'primary-button-lg' : 'disable-button-lg';

  const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,13}$/;

  const navigate = useNavigate();

  const checkUserId = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/check-userId`, {
=======
  const [isIdError, setIsIdError] = useState(false);
  const [isPasswordError, setPasswordError] = useState(false);
  const [isPasswordCheckError, setPasswordCheckError] = useState(false);
  const [isEmailError, setEmailError] = useState(false);
  const [isVerificationError, setVerificationError] = useState(false); // 인증 코드 오류 상태 추가


  const [idMessage, setIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordCheckMessage, setPasswordCheckMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [verificationMessage, setVerificationMessage] = useState(''); // 인증 메시지 상태 추가


  const [isIdCheck, setIdCheck] = useState(false);
  const [isEmailCheck, setEmailCheck] = useState(false);


  const signUpButtonClass = id && password && passwordCheck && email ? 'primary-button-lg' : 'disable-button-lg';


  const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,13}$/;


  const navigate = useNavigate();


  const checkUserId = async (userId) => {
    try {
      const response = await fetch('http://localhost:8080/api/users/check-userId', {
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const isAvailable = await response.json();
      setIsIdError(isAvailable);
      setIdMessage(isAvailable ?"이미 사용 중인 아이디입니다.": "사용 가능한 아이디입니다.");
      setIdCheck(!isAvailable);
    } catch (error) {
      console.error("Error checking userId:", error);
    }
  };

<<<<<<< HEAD
  const checkEmail = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/users/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const isAvailable = await response.json();  // true 값이면 이미 존재하는 이메일
      setEmailError(isAvailable);
      setEmailMessage(isAvailable ?"이미 사용 중인 이메일입니다." :"사용 가능한 이메일입니다." );
      setEmailCheck(!isAvailable);
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };

  const sendEmailVerification = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/users/send-verification-code`, {
=======

//   const checkEmail = async (email) => {
//     try {
//       const response = await fetch('http://localhost:8080/api/users/check-email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });
//       const isAvailable = await response.json();  // true 값이면 이미 존재하는 이메일
//       setEmailError(isAvailable);
//       setEmailMessage(isAvailable ?"이미 사용 중인 이메일입니다." :"사용 가능한 이메일입니다." );
//       setEmailCheck(!isAvailable);
//     } catch (error) {
//       console.error("Error checking email:", error);
//     }
//   };


  const sendEmailVerification = async (email) => {
    try {
      const response = await fetch('http://localhost:8080/api/users/send-verification-code', {
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email }), // ID와 이메일을 전송
      });
      const message = await response.text();
      setEmailMessage(message); // 성공 또는 실패 메시지 설정
      setEmailCheck(true); // 이메일 인증 요청을 한 것으로 설정
    } catch (error) {
      console.error("Error sending verification code:", error);
    }
  };

<<<<<<< HEAD
  const verifyCode = async (userId, email, code) => {
    try {
      const response = await fetch(`${API_URL}/api/users/verify-code`, {
=======

  const verifyCode = async (userId, email, code) => {
    try {
      const response = await fetch('http://localhost:8080/api/users/verify-code', {
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, email, certificationNumber: code }),
      });
      const isVerified = await response.json();
      setVerificationError(!isVerified);
      setVerificationMessage(isVerified ? "인증이 완료되었습니다." : "인증 코드가 일치하지 않습니다.");
    } catch (error) {
      console.error("Error verifying code:", error);
    }
  };

<<<<<<< HEAD
=======

>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
  const onEmailVerificationButtonClickHandler = async () => {
    if (!isEmailCheck) {  // 기본값이 false 이므로 중복 검사를 수행
      await checkEmail(email); // 이메일 중복 확인 호출
      // isEmailError가 true이면 중복된 이메일
<<<<<<< HEAD
      if (isEmailError) { 
=======
      if (isEmailError) {
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
        alert('이메일 중복 확인을 해주세요.'); // 오류가 있을 경우 사용자에게 경고
        return;
      }
    }
<<<<<<< HEAD
    
=======
   
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
    // 이메일이 유효한 경우 인증 코드 전송
    if (email && !isEmailError) { // isEmailError가 false인 경우에만 인증 코드 전송
      await sendEmailVerification(email);
    }
  };
<<<<<<< HEAD
  
  
=======
 
 

>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd

  const onSignUpButtonClickHandler = async () => {
    if (!id || !password || !passwordCheck || !email) return;
    if (!isIdCheck) {
      alert('ID 중복 확인은 필수입니다.');
      return;
    }
    const checkedPassword = passwordPattern.test(password);
    if (!checkedPassword) {
      setPasswordError(true);
      setPasswordMessage('영문, 숫자를 혼용하여 8~13자 입력해주세요.');
      return;
    }
    if (!isEmailCheck) {
        alert('이메일 중복 확인을 해주세요.');
        return;
<<<<<<< HEAD
    }
=======
      }
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
    if (password !== passwordCheck) {
      setPasswordCheckError(true);
      setPasswordCheckMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
<<<<<<< HEAD

    const requestBody = {
        password, 
        email,
        userId: id,
=======
    const requestBody = {
        username: id,
        userId: id,
        password,
        email,
        age:20
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
    };
    console.log(requestBody);
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    //   const responseBody = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "회원 가입이 완료되었습니다.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate('/login');
      } else {
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

    console.log(requestBody);

<<<<<<< HEAD
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // 응답에서 토큰 받기
        const responseBody = await response.json();
        const token = responseBody.token;  // 서버에서 반환한 토큰을 받음
        const userId = responseBody.user.userId;  // 서버에서 반환한 토큰을 받음

        // 토큰을 localStorage에 저장
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);

        // 회원가입 완료 후 /addUserInfo로 리다이렉트
        navigate('/addUserInfo');
      } else {
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleNaverLogin = () => {
      window.location.href = `${API_URL}/oauth2/authorization/naver`;
  };

  const handleKakaoLogin = () => {
      window.location.href = `${API_URL}/oauth2/authorization/kakao`;
  };

=======
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
  return (
    <div className='sign-up-container'>
      <div className='sign-up-box' >
          <h1 className="title-div" style={{ backgroundColor: '#96aaaa' }}>회원가입</h1>
          <div className='sign-up-content-box' >
            <div className='sign-up-content-sns-sign-in-box'></div>
              <div className='sign-up-content-sns-sign-in-title'>{'sns 회원가입'}</div>
                <div className='sign-up-content-sns-sign-in-button-box'>
<<<<<<< HEAD
                  <div className='kakao-sign-in-button' onClick={() => handleKakaoLogin('kakao')}></div>
                  <div className='naver-sign-in-button' onClick={() => handleNaverLogin('naver')}></div>
=======
                  <div className='kakao-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('kakao')}></div>
                  <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')}></div>
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                </div>
              <div className='sign-up-content-divider'></div>
              <div className='sign-up-content-input-box'>
                <InputBox
                  ref={idRef}
                  title='아이디'
                  placeholder='아이디를 입력해주세요'
                  type='text'
                  value={id}
                  onChange={(e) => { setId(e.target.value); setIdMessage(''); setIdCheck(false); }}
                  isErrorMessage={isIdError}
                  message={idMessage}
                  buttonTitle='중복 확인'
                  onButtonClick={() => checkUserId(id)}
                />
                <InputBox
                  ref={passwordRef}
                  title='비밀번호'
                  placeholder='비밀번호를 입력해주세요'
                  type='password'
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordMessage(''); }}
                  isErrorMessage={isPasswordError}
                  message={passwordMessage}
                />
                <InputBox
                  ref={passwordCheckRef}
                  title='비밀번호 확인'
                  placeholder='비밀번호를 입력해주세요'
                  type='password'
                  value={passwordCheck}
                  onChange={(e) => { setPasswordCheck(e.target.value); setPasswordCheckMessage(''); }}
                  isErrorMessage={isPasswordCheckError}
                  message={passwordCheckMessage}
                />
                <InputBox
                  ref={emailRef}
                  title='이메일'
                  placeholder='이메일 주소를 입력해주세요'
                  type='text'
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailMessage(''); }}
                  isErrorMessage={isEmailError}
                  message={emailMessage}
                  buttonTitle='이메일 인증'
<<<<<<< HEAD
                  onButtonClick={onEmailVerificationButtonClickHandler} 
=======
                  onButtonClick={onEmailVerificationButtonClickHandler}
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                />
                <InputBox
                  ref={verificationCodeRef}
                  title='인증 코드'
                  placeholder='인증 코드를 입력해주세요'
                  type='text'
                  value={verificationCode}
                  onChange={(e) => { setVerificationCode(e.target.value); setVerificationMessage(''); }}
                  isErrorMessage={isVerificationError}
                  message={verificationMessage}
                  buttonTitle='이메일 인증 확인'
                  onButtonClick={() => verifyCode(id, email, verificationCode)} // 인증 코드 확인 요청
                />
              </div>
              <div className='sign-up-content-button-box'>
<<<<<<< HEAD
                <div className={`${signUpButtonClass} full-width`} onClick={onSignUpButtonClickHandler}>{'다음'}</div>
=======
                <div className={`${signUpButtonClass} full-width`} onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
                {/* <div className='text-link-lg full-width' onClick={() => navigate('/login')}>{'로그인'}</div> */}
              </div>
          </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
