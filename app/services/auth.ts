import axios from "../lib/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// export async function postLogin(data: LoginRequest): Promise<LoginResponse> {
//   try {
//     const response = await axios.post<LoginResponse>('/api/Account/login', data);
//     return response.data;
//   } catch (error: any) {
//     console.log('Login failed', error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || 'An error occurred while logging in');
//   }
// }

export const postLogin = async (data: Record<string, string>) => {
  const response = await axios.post<LoginResponse>("/api/Account/login", data);
  console.log("Login API called with:", data);
  return Promise.resolve({ success: true, data: response.data });
};

export const postRegister = async (data: Record<string, string>) => {
  const response = await axios.post<LoginResponse>(
    "/api/Account/register",
    data
  );
  // Simulate register API call
  console.log("Register API called with:", data);
  return Promise.resolve({ success: true, data: response.data });
};
