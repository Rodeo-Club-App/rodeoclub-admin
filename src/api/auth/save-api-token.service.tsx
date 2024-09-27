import { api } from "@/services/api";

export function saveApiTokenService(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
