export const getToken = (key: string = 'jwt_token'): string | null => {
  if (key === 'jwt_token') {
    return localStorage.getItem('jwt_token') || 
           sessionStorage.getItem('jwt_token') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('token') ||
           localStorage.getItem('accessToken') ||
           sessionStorage.getItem('accessToken');
  }
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};


export const setToken = (token: string, rememberMe: boolean): void => {
  if (rememberMe) {
    localStorage.setItem('jwt_token', token);
    sessionStorage.removeItem('jwt_token');
  } else {
    sessionStorage.setItem('jwt_token', token);
    localStorage.removeItem('jwt_token');
  }
};

export const removeToken = (key?: string): void => {
  if (!key || key === 'jwt_token') {
    const keys = ['jwt_token', 'token', 'accessToken'];
    keys.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } else {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};


