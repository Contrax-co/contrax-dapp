// Method To Store User Session
export function setUserSession(data:any) {
    return localStorage.setItem('userOnboardData', JSON.stringify(data));
}

// Method To Fetch User Session
export function getUserSession() {
    return localStorage.getItem('userOnboardData');
}

// Method To Remove User Session
export function removeUserSession() {
    return localStorage.removeItem('userOnboardData');
}
  