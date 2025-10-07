import axios from 'axios';
import { User } from '../users/types/user';

export const getCurrentUser = (userId: string) => axios.get<User>(`/users/${userId}`);
