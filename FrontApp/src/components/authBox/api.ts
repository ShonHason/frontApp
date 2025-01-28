// src/api.ts
import axios from 'axios';

const API_URL = "http://localhost:4000"; // Replace with your actual API URL

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  console.log(userData+'*******************************************');
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data; // Assuming the server returns data in the response
};

export const loginUser = async (userData: {
  usernameOrEmail: string;
  password: string;
}) => {
  console.log("********loginUser**********");
  console.log(userData);
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  return response.data; // Assuming the server returns data in the response
};
export const googleSignIn = async (token: string) => {
  const response = await axios.post(`${API_URL}/google-signin`, { token });
  return response.data; // Assuming the server validates the token and returns user data
};