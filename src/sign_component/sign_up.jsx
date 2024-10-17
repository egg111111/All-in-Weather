import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './sign_up.css'


function SignUpForm() {
    const navigate = useNavigate();
    const {
        register,
        watch,
        formState: { isSubmitting, errors },
        handleSubmit,
    } = useForm();


    const password = watch("password", "");


    const submitForm = async (data) => {
        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
   
            if (response.ok) {
                console.log('User registered successfully!');
                Swal.fire({
                    title:"회원 가입이 완료되었습니다.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                })
                navigate('/login');
            } else {
                console.error('Failed to register user:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const jobOptions = [
        "무직", "경영·사무·금융·보험직", "연구직 및 공학 기술직",
        "교육·법률·사회복지·경찰·소방직 및 군인", "보건·의료직",
        "예술·디자인·방송·스포츠직", "미용·여행·숙박·음식·경비·청소직",
        "영업·판매·운전·운송직", "건설·채굴직", "설치·정비·생산직",
        "농업어업직", "학생"
    ];


    return (
        <div className="main_sign">
            <h1 className="title-div">회원가입</h1>
            <form onSubmit={handleSubmit(submitForm)} className="sub_sign">
                <label htmlFor="username">Username</label>
                <input
                    name="username"
                    type="text"
                    id="username"
                    placeholder="닉네임 입력"
                    {...register('username', {
                        required: "*닉네임을 입력해주세요"
                    })}
                />
                {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
                <br/>

                <label htmlFor="userId">ID</label>
                <input
                    name="userId"
                    type="text"
                    id="userId"
                    placeholder="아이디 입력"
                    {...register('userId', {
                        required: "*아이디를 입력해주세요",
                        minLength: {
                            value: 6,
                            message: "*6자 이상으로 입력해주세요"
                        }
                    })}
                />
                {errors.userId && <p style={{ color: 'red' }}>{errors.userId.message}</p>}
                <br/>

                <label htmlFor="age">Age</label>
                <input
                    name="age"
                    type="number"
                    id="age"
                    min={10}
                    max={100}
                    {...register('age', { min: 10, max: 100 })}
                />
                <br/>

                <label htmlFor="password">Password</label>
                <input
                    name="password"
                    type="password"
                    id="password"
                    placeholder="비밀번호 입력"
                    {...register('password', {
                        required: "*비밀번호를 입력해주세요",
                        minLength: { value: 6, message: "*비밀번호는 6~20자 사이로 설정해주세요" },
                        maxLength: { value: 20, message: "*비밀번호는 6~20자 사이로 설정해주세요" }
                    })}
                />
                {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                <br/>

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
                <br/>

                <label htmlFor="email">Email</label>
                <input
                    name="email"
                    type="text"
                    id="email"
                    placeholder="이메일 입력"
                    {...register('email', {
                        required: "이메일을 입력해주세요"
                    })}
                />
                {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                <br/>

                <label htmlFor="job">Job</label>
                <select
                    name="job_category"
                    id="job"
                    {...register("job", { required: "*직업을 선택해주세요" })}
                >
                    {jobOptions.map((job, index) => (
                        <option key={index} value={job}>{job}</option>
                    ))}
                </select>
                <br/>

                <button type="submit" disabled={isSubmitting}>
                    회원가입
                </button>
            </form>
        </div>
    );
}


export default SignUpForm;
