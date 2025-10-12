import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const employeeService = {
  async clockInOut(id, type, location) {
    const response = await axios.post(`${API_URL}/api/employee/clock`, {
      id,
      type,
      location,
    });
    return response.data;
  },

  async getAttendanceHistory(id) {
    const response = await axios.get(`${API_URL}/api/employee/${id}/attendance`);
    return response.data;
  },

  async getEmployeeDetails(id) {
    const response = await axios.get(`${API_URL}/api/employee/${id}`);
    return response.data;
  },
};