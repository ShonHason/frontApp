// file.api.js
import axios from 'axios';
const API_URL = "http://localhost:4000";

const preUserUploadImage = async (file:string) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post(`${API_URL}/file`, formData, {
        headers: {
          'Authorization': `jwt ${localStorage.getItem('accessToken')}`, 
        },
      });
  
      // Return the image URL from the response
      console.log(response.data.url);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('שגיאה בהעלאת התמונה');
    }
  };

const uploadImage = async (file:string) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/file`, formData, {
      headers: {
        'Authorization': `jwt ${localStorage.getItem('accessToken')}`, 
      },
    });

    // Return the image URL from the response
    console.log(response.data.url);
    localStorage.removeItem('imageUrl');
    localStorage.setItem('imageUrl', response.data.url);
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('שגיאה בהעלאת התמונה');
  }
};
const saveImg = async (file:string) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.post(`${API_URL}/auth/myuser/saveImg`,{
            username: localStorage.getItem('username'),
            file: file
        }, {
        headers: {
            'Content-Type': 'application/json' ,
            'Authorization': "jwt " + accessToken, 
            
        },
        });
    
        // Return the image URL from the response
        return response.data.imageUrl;

    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(' שגיאה בהעלאת התמונה');
    }

}
const getImg = async (username: string) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        
        // Using query params
        const response = await axios.get(`${API_URL}/auth/getImg`, {
            params: { username: username }, // Send username as query parameter
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "jwt " + accessToken, 
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('שגיאה בהעלאת התמונה');
    }
}

export { uploadImage , saveImg , getImg, preUserUploadImage };
