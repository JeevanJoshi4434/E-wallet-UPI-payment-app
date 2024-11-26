"use client";

import React, { createContext, useContext, useReducer } from 'react';
import { useCookies } from 'react-cookie'; // for handling cookies
import Cookies from 'js-cookie'; // alternative for setting cookie options

// Initial state with two fields: Authorize and OpenMapAPI
const initialState = {
    Authorize: false,
    user: null || Object,
    token: null || String,
};

// Create the AuthContext
const AuthContext = createContext({
    authState: initialState,
    dispatch: () => null,
});

// Reducer function to handle state updates
const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                Authorize: action.Authorize,
                user: action.user,
                token: action.token,
            };
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
};

// AuthProvider component
const AuthProvider = ({ children }) => {
    const [authState, dispatch] = useReducer(authReducer, initialState);
    const [cookies, setCookie] = useCookies(['Authorize', 'user', 'token']);

    // Function to set data in cookies for 30 days
    const setAuthCookies = (Authorize) => {
        Cookies.set('Authorize', Authorize);
    };


    // Function to handle LOGIN action with API check
    const login = async (user, token) => {
        try{
            dispatch({ type: 'SET_USER', Authorize: true, user:user, token:token });
            return true;
        }catch(error){
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ authState, dispatch, login }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthProvider, useAuth };
