import { STORAGE_USER_KEY } from ".";

export async function SaveUserInLocalStorage(user: USER_DTO) {
  try {
    const userInStringify = JSON.stringify(user);
    localStorage.setItem(STORAGE_USER_KEY, userInStringify);
  } catch (error) {
    throw error;
  }
}

export async function getUserInLocalStorage(): Promise<USER_DTO> {
  try {
    const localStorageResponse = localStorage.getItem(STORAGE_USER_KEY);
    const userLogged: USER_DTO = localStorageResponse
      ? JSON.parse(localStorageResponse)
      : {};
    return userLogged;
  } catch (error) {
    throw error;
  }
}

export async function removeUserInLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_USER_KEY);
  } catch (error) {
    throw error;
  }
}
