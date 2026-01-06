export const API_BASE_URL = 'http://10.17.70.241:5000/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  MENU: {
    ADD: `${API_BASE_URL}/menu/add`,
    ALL: `${API_BASE_URL}/menu/all`,
    UPDATE: (id) => `${API_BASE_URL}/menu/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/menu/delete/${id}`
  },
  ATTENDANCE: {
    MARK: `${API_BASE_URL}/attendance/mark`,
    ALL: `${API_BASE_URL}/attendance/all`,
    BY_DATE: (date) => `${API_BASE_URL}/attendance/date/${date}`,
    BY_STUDENT: (name) => `${API_BASE_URL}/attendance/student/${name}`
  },
  EXPENSES: {
    ADD: `${API_BASE_URL}/expenses/add`,
    ALL: `${API_BASE_URL}/expenses/all`,
    UPDATE: (id) => `${API_BASE_URL}/expenses/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/expenses/delete/${id}`,
    SUMMARY: `${API_BASE_URL}/expenses/summary`
  }
};