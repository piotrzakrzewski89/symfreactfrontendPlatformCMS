// axiosCompany.js
import axios from 'axios';
import { API_AUTH_URL, API_COMPANY_URL, API_USER_URL, API_PLATFORM_URL } from '../config';

export const axiosCompany = axios.create({
  baseURL: API_COMPANY_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosUser = axios.create({
  baseURL: API_USER_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosAuth = axios.create({
  baseURL: API_AUTH_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosPlatform = axios.create({
  baseURL: API_PLATFORM_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default axiosCompany;