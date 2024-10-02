import { env } from "@/env";
import axios from "axios";

type logoutControllerType = {
  token: string;
};

export async function logoutController(props: logoutControllerType) {
  const { token } = props;
  if (!token) return;

  try {
    await axios.post(
      `${env.BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return null;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
