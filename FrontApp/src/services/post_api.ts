import axios from "axios";

const API_URL = "https://node03.cs.colman.ac.il";
export const myPosts = async (owner: string) => {
  try {
    const response = await axios.get(`${API_URL}/Posts/${owner}`);
    return response.data;
  } catch (error) { 
    console.error("Error fetching posts:", error);
    throw error;
  }
};

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
    const response = await axios.get(`${API_URL}/Posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error; // You might want to handle this better depending on your requirements
  }
};
export const addLike = async (postId: string) => {
  try {
    const response = await axios.put(`${API_URL}/Posts/like/${postId}`,{},{
      headers: {
       'authorization': `jwt ${localStorage.getItem('accessToken')}`, 
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding like:", error);
    throw error; // מיידע את המשתמש אם יש שגיאה
  }
};

export const unlike = async (postId: string) => {
  try {
    const response = await axios.put(`${API_URL}/Posts/unlike/${postId}`,{},{
      headers: {
        'authorization': `jwt ${localStorage.getItem('accessToken')}`, 
      },
    });
    return response.data; // החזרת התגובה מהשרת אם יש
  } catch (error) {
    console.error("Error removing like:", error);
    throw error;
  }
};
export const getComments = async (postId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/Comments/?post_id=${postId}`
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
  imgUrl?: string;
  owner: string;
  rank: number;
}) => {
  try {
    console.log('Adding Post - Input Data:', postData);
    
    // Retrieve the access token from localStorage
    const accessToken = localStorage.getItem("accessToken");
    const owner = localStorage.getItem("username"); // Assuming you store username

    if (!accessToken) {
      throw new Error("Access token not found. Please log in.");
    }

    // Ensure owner is added to the postData
    const completePostData = {
      ...postData,
      owner: owner || postData.owner,
      // Provide a default image URL if not supplied
      imgUrl: postData.imgUrl || ''
    };

    console.log('Complete Post Data:', completePostData);

    // Make the API call
    const response = await axios.post(`${API_URL}/Posts/`, completePostData, {
      headers: {
        'Authorization': `jwt ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    console.log('Post Creation Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Detailed Error adding post:", {
      error,
      errorResponse: (error as any).response?.data,
      errorStatus: (error as any).response?.status
    });
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
  commentId: string,
  postData: {
    comment: string;
    owner: string;
  }
) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    console.log(postData.comment);
    console.log(commentId); 
    const response = await axios.put(
      `${API_URL}/Comments/${commentId}`,
      { comment: postData.comment }
      ,
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
export const isLiked = async (postId: string) => {
  try {
    const response = await axios.get(`${API_URL}/Posts/isLiked/${postId}`, {
      headers: {
        authorization: `jwt ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking like status:", error);
    throw error;
  }
};
