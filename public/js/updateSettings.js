// Update Settings
import { showAlert } from './alert';
import axios from 'axios';

// Type is either 'data' or 'password'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? 'api/v1/users/updateMe'
        : 'api/v1/users/updateMyPassword';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
      withCredentials: true,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
  }
};
