import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://striking-insight-production.up.railway.app', // Replace with your base URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
