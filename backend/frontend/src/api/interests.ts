import api from './client';
import type { ApiResponse, Interest } from '../types';

export const interestsApi = {
  // Returns Interest[] with { id, name } — uses the list endpoint
  getAll: () =>
    api.get<ApiResponse<Interest[]>>('/interest/list'),
};
