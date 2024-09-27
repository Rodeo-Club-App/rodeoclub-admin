import { STORAGE_AUTH_TOKENS_KEY } from ".";

export async function SaveAuthTokensInLocalStorage(
  authTokens: USER_AUTH_TOKENS_DTO
) {
  try {
    const authTokenInStringify = JSON.stringify(authTokens);
    localStorage.setItem(STORAGE_AUTH_TOKENS_KEY, authTokenInStringify);
  } catch (error) {
    throw error;
  }
}

export async function getAuthTokensInLocalStorage() {
  try {
    const AuthTokensResponse = localStorage.getItem(STORAGE_AUTH_TOKENS_KEY);
    const authTokens: USER_AUTH_TOKENS_DTO = AuthTokensResponse
      ? JSON.parse(AuthTokensResponse)
      : {};
    console.log("token", authTokens.token);
    return authTokens;
  } catch (error) {
    throw error;
  }
}

export async function removeAuthTokensInLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_AUTH_TOKENS_KEY);
  } catch (error) {
    throw error;
  }
}
