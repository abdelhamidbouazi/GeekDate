import { apiClient } from "@/lib/api/client"

export const api = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  postFormData: apiClient.post,
  putFormData: apiClient.put,
  delete: apiClient.delete,
}

