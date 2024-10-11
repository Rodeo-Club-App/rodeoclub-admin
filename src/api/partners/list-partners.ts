import { api } from "../../services/api";

interface Partner {
  id: number;
  name: string;
}

export async function listPartners() {
  const response = await api.get<Partner[]>("/partners/rodeoclub");

  return response.data;
}
