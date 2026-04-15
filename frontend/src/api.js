import axios from 'axios';
import * as mockApi from './mockApi';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const useMock = import.meta.env.MODE === 'development';

export function setToken(token) {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
}

function isNetworkError(error) {
  return (
    !error.response ||
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('ECONNREFUSED')
  );
}

async function tryApi(call, mockFallback) {
  if (useMock) {
    return mockFallback();
  }

  try {
    return await call();
  } catch (error) {
    if (isNetworkError(error)) {
      return mockFallback();
    }
    throw error;
  }
}

export async function loginUser(credentials) {
  return tryApi(
    async () => {
      const response = await API.post('/api/auth/login', credentials);
      return response.data;
    },
    () => mockApi.loginUser(credentials)
  );
}

export async function registerUser(details) {
  return tryApi(
    async () => {
      const response = await API.post('/api/auth/register', details);
      return response.data;
    },
    () => mockApi.registerUser(details)
  );
}

export async function loadIssues(filters = {}) {
  return tryApi(
    async () => {
      const response = await API.get('/api/issues', { params: filters });
      return response.data;
    },
    () => mockApi.loadIssues(filters)
  );
}

export async function createIssue(payload) {
  return tryApi(
    async () => {
      const response = await API.post('/api/issues', payload);
      return response.data;
    },
    () => mockApi.createIssue(payload)
  );
}

export async function voteIssue(issueId) {
  return tryApi(
    async () => {
      const response = await API.post('/api/vote', { issue_id: issueId });
      return response.data;
    },
    () => mockApi.voteIssue(issueId)
  );
}

export async function updateIssueStatus(issueId, status) {
  return tryApi(
    async () => {
      const response = await API.put(`/api/issues/${issueId}/status`, { status });
      return response.data;
    },
    () => mockApi.updateIssueStatus(issueId, status)
  );
}
