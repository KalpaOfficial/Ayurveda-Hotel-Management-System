import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5001', // ✅ matches your backend server
  headers: { 'Content-Type': 'application/json' }
});
