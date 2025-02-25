import axios from "axios";

const API_URL = "http://localhost:4000"; // Replace with your actual API URL

// ✅ Register a new user
export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  console.log(userData + "*******************************************");
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

// ✅ Login user
export const loginUser = async (userData: {
  usernameOrEmail: string;
  password: string;
}) => {
  console.log("********loginUser**********");
  console.log(userData);
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  console.log(response.data.accessToken);
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("userId", response.data._id);


  return response.data;
};

// ✅ Google Sign-In
export const googleSignIn = async (token: string) => {
  const response = await axios.post(`${API_URL}/auth/google-signin`, { token });
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("userId", response.data.userId);


  return response.data;
};

// ✅ Fetch user details
export const getUser = async (userId: string) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
};

// ✅ Update user details
export const updateUser = async (userId: string, userData: { username?: string; email?: string }) => {
  const response = await axios.put(`${API_URL}/users/update/${userId}`, userData);
  return response.data;
};

// ✅ Delete user account
export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${API_URL}/users/delete/${userId}`);
  return response.data;
};
export const logout = async () => {
  const response = await axios.post(`${API_URL}/auth/logout`,localStorage.getItem("refreshToken"));
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return response.data;
}
