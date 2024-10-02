import {
  SaveAuthTokensInLocalStorage,
  getAuthTokensInLocalStorage,
  removeAuthTokensInLocalStorage,
} from "@/storage/storageUsersTokens";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { logout } from "./logout";
import { AppError } from "@/errors/AppError";
import { env } from "@/env";
// import { useNavigate } from "react-router-dom";
import { refreshTokenController } from "@/controllers/auth/refreshTokenController";
import { navigateToLogin } from "@/utils/navigationHelper"; // Função para redirecionar

export const api = axios.create({
  baseURL: env.BASE_URL,
});

type failedRequestQueueProps = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError | any) => void;
};

let isRefreshing = false;
let failedRequestQueue: failedRequestQueueProps[] = [];

// const navigate = useNavigate();
api.interceptors.response.use(
  (response) => response,
  async (requestError: AxiosError<any>) => {
    if (!requestError.response) {
      return Promise.reject(requestError);
    }

    if (requestError.response.status === 401) {
      const { message } = requestError.response.data;
      if (message === "jwt expired") {
        const authToken = await getAuthTokensInLocalStorage();

        if (!authToken.refreshToken) {
          await logout();
          navigateToLogin();
          // navigate("/signin");
          // router.replace("/(auth)/signIn");
          return Promise.reject(requestError);
        }
        const originalRequestConfig =
          requestError.config as InternalAxiosRequestConfig;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalRequestConfig.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequestConfig));
              },
              onFailure: (error: AxiosError) => {
                reject(error);
              },
            });
          });
        }

        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const { access_token, refresh_token } =
              await refreshTokenController({
                refreshToken: authToken.refreshToken,
              });
            await SaveAuthTokensInLocalStorage({
              token: access_token,
              refreshToken: refresh_token,
            });

            if (originalRequestConfig.data) {
              originalRequestConfig.data = JSON.parse(
                originalRequestConfig.data
              );
            }

            originalRequestConfig.headers.Authorization = `Bearer ${access_token}`;

            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${access_token}`;

            failedRequestQueue.forEach((request) => {
              request.onSuccess(access_token);
            });

            console.log("TOKEN ATUALIZADO");

            resolve(api(originalRequestConfig));
          } catch (error: any) {
            console.log(error);
            failedRequestQueue.forEach((request) => {
              request.onFailure(error);
            });

            await logout();
            navigateToLogin();
            // navigate("/signin");

            // router.replace("/(auth)/signIn");
            reject(error);
          } finally {
            isRefreshing = false;
            failedRequestQueue = [];
          }
        });
      } else {
        await removeAuthTokensInLocalStorage();
        navigateToLogin();
        // router.replace("/(auth)/signIn");
        // navigate("/signin");
      }
    }

    if (requestError.response?.data && requestError.response.data.message) {
      return Promise.reject(
        new AppError(
          requestError.response.data.message,
          requestError.response.data.statusCode
        )
      );
    }

    return Promise.reject(requestError);
  }
);
