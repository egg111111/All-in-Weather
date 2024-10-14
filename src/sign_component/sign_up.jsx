import React, { useState } from "react";
import { useForm } from "react-hook-form";

function Sign_up_Form() {
    const {
        register,
        watch,
        formState: {
            isSubmitting,
            errors
        },
        handleSubmit,
    } = useForm();

    // 비밀번호 체크
    const password = watch("password", ""); 

    const submitForm = (data) => {
        console.log(data);
        // 서버와 연결하는 함수 
        // 서버에게 데이터를 보냄 
        // fetch('/api/endpoint', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // }).then(response => {
        //     if (response.ok) {
        //         console.log('Data sent successfully!');
        //     }
        // });
    }

    return (
        <div className="main_sign">
            <h3>회원가입</h3>
            <form onSubmit={handleSubmit(submitForm)} className="sub_sign">
                <label htmlFor="username">Username</label>
                <input
                    name="username"
                    type="text"
                    id="username"
                    placeholder="닉네임 입력"
                    {...register('username', {
                        required: "*닉네임을 입력해주세요"
                    })} />
                {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}

                <label htmlFor="user_id">ID</label>
                <input
                    name="user_id"
                    type="text"
                    id="user_id"
                    placeholder="아이디 입력"
                    {...register('user_id', {
                        required: "*아이디를 입력해주세요",
                        minLength: {
                            value: 6,
                            message: "*6자 이상으로 입력해주세요"
                        }
                    })} />
                {errors.user_id && <p style={{ color: 'red' }}>{errors.user_id.message}</p>}

                <label htmlFor="age">age</label>
                <input
                    name="age"
                    type="number"
                    id="age"
                    min={0}
                    max={100}
                    {...register('age', { min: 10, max: 100 })} />

                <label htmlFor="password">password</label>
                <input
                    name="password"
                    type="password"
                    id="password"
                    placeholder="비밀번호 입력"
                    {...register('password', {
                        required: "*비밀번호를 입력해주세요",
                        minLength: { value: 6, message: "*비밀번호는 6~20자 사이로 설정해주세요" },
                        maxLength: { value: 20, message: "*비밀번호는 6~20자 사이로 설정해주세요" }
                    })} />
                {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                <input
                    id="password2"
                    type="password"
                    placeholder="비밀번호 재입력"
                    {...register('password2', {
                        required: "*비밀번호를 다시 한 번 입력해주세요",
                        validate: value => value === password || "*비밀번호가 일치하지 않습니다"
                    })}
                />
                {errors.password2 && <p style={{ color: 'red' }}>{errors.password2.message}</p>}

                <label htmlFor="job">job</label>
                <select name="job_category" id="job"
                    {...register("job", {
                        required: "*직업을 선택해주세요"
                    })}>
                    <option value="무직">무직</option>
                    <option value="경영·사무·금융·보험직">경영·사무·금융·보험직</option>
                    <option value="연구직 및 공학 기술직">연구직 및 공학 기술직</option>
                    <option value="교육·법률·사회복지·경찰·소방직 및 군인">교육·법률·사회복지·경찰·소방직 및 군인</option>
                    <option value="보건·의료직">보건·의료직</option>
                    <option value="예술·디자인·방송·스포츠직">예술·디자인·방송·스포츠직</option>
                    <option value="미용·여행·숙박·음식·경비·청소직">미용·여행·숙박·음식·경비·청소직</option>
                    <option value="영업·판매·운전·운송직">영업·판매·운전·운송직</option>
                    <option value="건설·채굴직">건설·채굴직</option>
                    <option value="설치·정비·생산직">설치·정비·생산직</option>
                    <option value="농업어업직">농업어업직</option>
                    <option value="학생">학생</option>
                </select>

                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    회원가입
                </button>
            </form>
        </div>
    );
}

export default Sign_up_Form;
