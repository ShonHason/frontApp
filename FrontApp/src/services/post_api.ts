// src/api/post_api.ts
import axios from 'axios';

const API_URL = "http://localhost:4000"; // Your API URL

export const addComment = async (postId: string, comment: string) => {
    try {
        const response = await axios.post(`${API_URL}/Comments/`, { postId, comment , owner: "1234"}); //need to chane the owner name
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error; // You might want to handle this better depending on your requirements
    }
    };

export const singlePost = async (postId: string) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error; // You might want to handle this better depending on your requirements
  }
};
export const addLike = async (postId: string) => {
    try {
      const response = await axios.put(`${API_URL}/Posts/like/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error adding like:", error);
      throw error; // מיידע את המשתמש אם יש שגיאה
    }
  };
  
  export const unlike = async (postId: string) => {
    try {
      const response = await axios.put(`${API_URL}/Posts/unlike/${postId}`);
      return response.data; // החזרת התגובה מהשרת אם יש
    } catch (error) {
      console.error("Error removing like:", error);
      throw error; 
    }
  };
  export const getComments = async (postId: string) => {    
    try {
      const response = await axios.get(`${API_URL}/Comments/getCommentsByPostId/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }
  export const addPost = async (postData: {
    title: string;
    content: string;
    imgUrl: string;
    owner: string;
  }) => {
    try {
      // Retrieve the access token and userId from localStorage
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
  
      // Ensure accessToken and userId are present
      if (!accessToken || !userId) {
        throw new Error("Access token or User ID not found in localStorage");
      }
  
      // Add owner to the postData
      postData.owner = userId;
  
      // Pass the token in the Authorization header
      const response = await axios.post(`${API_URL}/Posts/`, postData, {
        headers: {
          Authorization: "jwt " + accessToken,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding post:", error);
      throw error;
    }
  };
  
  