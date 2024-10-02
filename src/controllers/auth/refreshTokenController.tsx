import { env } from "@/env";
import { AppError } from "@/errors/AppError";
import axios from "axios";

type refreshTokenProps = {
  refreshToken: string | null;
};

type refreshTokenResponseProps = {
  access_token: string;
  refresh_token: string;
};

export async function refreshTokenController({
  refreshToken,
}: refreshTokenProps) {
  if (!refreshToken) {
    throw new AppError("não existe refreshToken");
  }
  try {
    const response = await axios.post<refreshTokenResponseProps>(
      `${env.BASE_URL}/auth/refresh`,
      null,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}
