import { User } from '../../modules/users/models/user.model';
import { ApiResponse } from '../models/api.models';

export const MOCK_USER: User = {
  id: 'user123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
};

export const MOCK_USER_RESPONSE: ApiResponse<User> = {
  success: true,
  data: MOCK_USER,
  message: 'Usuario obtenido con éxito'
};

export const MOCK_LOGIN_RESPONSE: ApiResponse<{ token: string, user: User }> = {
  success: true,
  data: {
    token: 'mock-auth-token',
    user: MOCK_USER
  },
  message: 'Inicio de sesión exitoso'
};

export const MOCK_REGISTER_RESPONSE: ApiResponse<{ id: string }> = {
  success: true,
  data: { id: 'user123' },
  message: 'Usuario registrado con éxito'
};