import axios from 'axios';
import { User } from './types/user';

interface UserFilters {
  email?: string;
  name?: string;
  status?: string;
  role?: string;
  createdFrom?: string;
  createdTo?: string;
}

export const getUsers = (filters?: UserFilters) => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.append(key, value);
      }
    });
  }

  const queryString = params.toString();
  const url = queryString ? `/users?${queryString}` : '/users';

  return axios.get<User[]>(url);
};

export const getUserById = (id: string) => axios.get<User>(`/users/${id}`);
