import { logoutController } from "@/controllers/auth/logoutController";
import { AppError } from "@/errors/AppError";
import { removeUserInLocalStorage } from "@/storage/storageUser";
import {
  getAuthTokensInLocalStorage,
  removeAuthTokensInLocalStorage,
} from "@/storage/storageUsersTokens";

export async function logout() {
  try {
    const { token } = await getAuthTokensInLocalStorage();
    await Promise.all([
      logoutController({ token }),
      removeAuthTokensInLocalStorage(),
      removeUserInLocalStorage(),
    ]);
  } catch (error) {
    throw new AppError("Falha ao realizar o logout");
  }
}
