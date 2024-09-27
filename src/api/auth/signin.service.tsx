import { api } from "@/services/api";

type signInResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    name: string;
    email: string;
    id: string;
    avatarUrl: string;
  };
};

export async function signinService({
  email,
  password,
}: SIGN_IN_DTO): Promise<signInResponse> {
  try {
    const response = await api.post<signInResponse>("/auth/signin/rodeoclub", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}
