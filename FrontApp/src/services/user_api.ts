import axios from "axios";

const API_URL = "https://10.10.246.3";

// ✅ Register a new user
export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  imgUrl: string;
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
  console.log(userData);
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  console.log(response.data);
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("username", response.data.username);
  localStorage.setItem("imageUrl", response.data.imagePath);

  return response.data;
};

// ✅ Google Sign-In
export const googleSignIn = async (token: string) => {
  const response = await axios.post(`${API_URL}/auth/google-signin`, { token });
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("username", response.data.username);
  localStorage.setItem("imageUrl", response.data.imagePath);



  return response.data;
};

// ✅ Update user details
export const updateUser = async (oldUsername : string , newUsername : string) => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await axios.put(`${API_URL}/auth/myuser/updateAccount/`, {oldUsername, newUsername},{
    headers: {
      Authorization: "jwt " + accessToken, // Attach the accessToken in the header
    },
  });
  return response.data;
};

// ✅ Delete user account
export const deleteUser = async (username : string) => {
  const accessToken = localStorage.getItem("accessToken");
  const response = await axios.delete(`${API_URL}/auth/myuser/deleteAccount?username =${username}`,{
    headers: {
      Authorization: "jwt " + accessToken, // Attach the accessToken in the header
    },
  });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("username");
  localStorage.removeItem("imageUrl");

  localStorage.clear();
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (refreshToken) {
    const response = await axios.post(`${API_URL}/auth/logout`, { refreshToken });
    
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("imageUrl");

    localStorage.clear();
    
    return response.data;
  } else {
    console.error("No refresh token found");
  }
}
const checkTokenExpiration = async () => {
  console.log('Trying Refresh token...');

  const token = localStorage.getItem('accessToken');
  if (!token) return;

  try {
    const { exp } = JSON.parse(atob(token.split('.')[1])); 
    const now = Math.floor(Date.now() / 1000); 
    const timeLeft = exp - now; 

    console.log(`Token expires in ${timeLeft} seconds`);

    if (timeLeft <= 120) { 
      console.log('Refreshing token...');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return;
      }

      const newToken = await axios.post((`${API_URL}/auth/refresh/`),{refreshToken});
      if (!newToken) {
        console.warn('Token refresh failed, redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem("imgUrl");

        localStorage.clear();
        window.location.href = '/'; // ניתוב למסך התחברות
      }
      localStorage.setItem('accessToken', newToken.data.accessToken);
      localStorage.setItem('refreshToken', newToken.data.refreshToken);
      console.log('Token refreshed successfully');


    }
  } catch (error) {
    console.error('Error checking token expiration', error);
  }
};

setInterval(checkTokenExpiration, 100000); 
  

// Function to change the password
export const changePassword = async (username:string, oldPassword:string, newPassword:string) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found!");
      return;
    }

    const response = await axios.put(
      `${API_URL}/auth/myuser/changePassword`, 
      {
        username: username,
        oldPassword: oldPassword,
        newPassword: newPassword
      },
      {
        headers: {
          Authorization: "jwt " + accessToken, // Attach the accessToken in the header
        },
      }
    );

    // You can return the response data or handle success here
    console.log("Password changed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error; // Rethrow the error if needed
  }
};

export const deleteAccount = async () => { 
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found!");
      return;
    }
    const username = localStorage.getItem("username");  
    const response = await axios.delete(
      `${API_URL}/auth/myuser/deleteAccount?username=${username}`, 
      {
        headers: {
          Authorization: "jwt " + accessToken, // Attach the accessToken in the header
        },
      });

    // You can return the response data or handle success here
    console.log("Account deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error; // Rethrow the error if needed
  }
}
export const getUserData = async (username:string) => {  
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("No access token found!");
      return;
    }
    const response = await axios.get(`${API_URL}/auth/myuser/${username}`,{
      headers: {
        Authorization: "jwt " + accessToken, // Attach the accessToken in the header
      },
    });
    // You can return the response data or handle success here
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Rethrow the error if needed
  }
}

