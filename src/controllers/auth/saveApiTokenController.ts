import { api } from "@/services/api";

export function saveApiTokenController(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
