// src/api/post_api.ts
import axios from "axios";

const API_URL = "http://localhost:4000"; // Your API URL

export const addComment = async (newcomment: {
  postId: string;
  comment: string;
  owner: string;
}) => {
  const accessToken = localStorage.getItem("accessToken");
  try {
    console.log(newcomment);
    const response = await axios.post(
      `${API_URL}/Comments/`,
      {
        postId: newcomment.postId,
        comment: newcomment.comment,
        owner: newcomment.owner,
      },
      {
        headers: {
          Authorization: "jwt " + accessToken,
        },
      }
    );
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
    const response = await axios.get(
      `${API_URL}/Comments/getCommentsByPostId/${postId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};
export const addPost = async (postData: {
  title: string;
  content: string;
  imgUrl: string;
  owner: string;
  rank: number;
}) => {
  try {
    // Retrieve the access token and userId from localStorage
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Access token not found in localStorage");
    }

    // Add owner to the postData

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
export const deletePost = async (postId: string) => {
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.delete(`${API_URL}/Posts/delete/${postId}`, {
      headers: {
        Authorization: "jwt " + accessToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const deleteComment = async (commentId: string) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.delete(`${API_URL}/Comments/${commentId}`, {
      headers: {
        Authorization: "jwt " + accessToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
export const updateComment = async (
  postId: string,
  postData: {
    comment: string;
    owner: string;
  }
) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.put(
      `${API_URL}/Comments/${postId}`,
      postData,
      {
        headers: {
          Authorization: "jwt " + accessToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};
export const updatePost = async (
  postId: string,
  postData: { title: string; content: string }
) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.put(`${API_URL}/Posts/${postId}`, postData, {
      headers: {
        Authorization: "jwt " + accessToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};
