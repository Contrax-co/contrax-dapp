// Method To Store User Session
export function setUserSession(data: any) {
  return localStorage.setItem("userOnboardData", JSON.stringify(data));
}

// Method To Fetch User Session
export function getUserSession() {
  return localStorage.getItem("userOnboardData");
}

export function getUserPreferences() {
  return window.localStorage.getItem("userPreferences");
}

export function setUserPreferences(data: any) {
  return window.localStorage.setItem("userPreferences", JSON.stringify(data));
}

// Method To Remove User Session
export function removeUserSession() {
  return localStorage.removeItem("userOnboardData");
}

// Method To Store SelectedToken
export function setSelectedToken(data: any) {
  return localStorage.setItem("selectedToken", JSON.stringify(data));
}

// Method To Fetch SelectedToken
export function getSelectedToken(): string | null {
  return localStorage.getItem("selectedToken");
}

// Method To Remove SelectedToken
export function removeSelectedToken() {
  return localStorage.removeItem("selectedToken");
}
