import { api } from "../../services/api";

export interface IPartner {
  id: number;
  name: string;
  cnpj: string | null;
}

export async function listPartners() {
  const response = await api.get<IPartner[]>("/partners/rodeoclub");

  return response.data;
}
