import axios from 'axios';
import { User } from '../users/types/user';

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
};

export type UpdateProfilePayload = {
  id: string;
  data: UpdateProfileInput;
};

export const updateProfile = (payload: UpdateProfilePayload) =>
  axios.patch<User>(`/users/${payload.id}`, payload.data);
