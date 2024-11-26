// src/store/persistMiddleware.js
const persistMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    localStorage.setItem('reduxState', JSON.stringify(store.getState()));
    return result;
  };
  
  export default persistMiddleware;
  