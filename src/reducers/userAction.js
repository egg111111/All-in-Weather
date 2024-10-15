export const loginAction = (loginData) => async (dispatch) => {
    try {
        const response = await fetch('http://localhost:8080/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        if (response.ok) {
            const data = await response.json();
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: data.user,
                    token: data.token,
                },
            });
        } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData.message);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
};
