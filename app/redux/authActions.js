// redux/authActions.js
"use client";
import { login as setLogin, logout } from './authSlice';
import { persistor } from './store'; // Import persistor from the store

// Login action
export const login = (user, token) => async (dispatch) => {
    try {
        dispatch(
            setLogin({ // Use the defined login action
                user,
                token,
            })
        );
        return true;
    } catch (error) {
        return false;
    }
};

// Logout action
export const performLogout = () => async(dispatch) => {
    try {   
        dispatch(logout());
        await persistor.purge();
        return true;
    } catch (error) {
        return false;
    }
};
