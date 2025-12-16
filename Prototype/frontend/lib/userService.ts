import API_BASE_URL from './api';
// User API service for handling user-related requests

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  balance: number;
  profileImageUrl?: string | null;
}

// Upload profile image for current user
export const uploadProfileImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  console.log('Uploading profile image');
  const formData = new FormData();
  formData.append('file', file);
<<<<<<< HEAD
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
=======
>>>>>>> 628b917f7cef3fbceefa4a642393f7368c7b7ac9
  const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile image');
  }
  const data = await response.json();
  return data.imageUrl;
};

export const getUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

<<<<<<< HEAD
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
=======
>>>>>>> 628b917f7cef3fbceefa4a642393f7368c7b7ac9
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      throw new Error('Authentication expired');
    }
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  return response.json();
};

export const updateUserEmail = async (newEmail: string, currentPassword: string) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

<<<<<<< HEAD
  console.log('Updating user email');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
=======
>>>>>>> 628b917f7cef3fbceefa4a642393f7368c7b7ac9
  const response = await fetch(`${API_BASE_URL}/users/email`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newEmail, currentPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update email');
  }

  return response.json();
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

<<<<<<< HEAD
  console.log('Updating user password');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
=======
>>>>>>> 628b917f7cef3fbceefa4a642393f7368c7b7ac9
  const response = await fetch(`${API_BASE_URL}/users/password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update password');
  }

  return response.json();
};

export const updateUserName = async (newName: string, currentPassword: string) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

<<<<<<< HEAD
  console.log('Updating user name');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
=======
>>>>>>> 628b917f7cef3fbceefa4a642393f7368c7b7ac9
  const response = await fetch(`${API_BASE_URL}/users/name`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newName, currentPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update name');
  }

  return response.json();
};