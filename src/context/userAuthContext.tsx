import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  SaveUserInLocalStorage,
  getUserInLocalStorage,
} from "../storage/storageUser";
import {
  SaveAuthTokensInLocalStorage,
  getAuthTokensInLocalStorage,
} from "../storage/storageUsersTokens";

// import { createUserNotificationTokenController } from "@/controllers/user/createUserNotificationTokenController";
// import { errorToastHandler } from "@/_errors/errorToastHandler";
// import { logout } from "@/services/logout";
import { saveApiTokenService } from "@/api/auth/save-api-token.service";
import { signinService } from "@/api/auth/signin.service";
// import { logout } from "@/service/logout";

type userAuthContextType = {
  user: USER_DTO | null;
  signIn: (props: SIGN_IN_DTO) => Promise<void>;
  // signUp: (props: SIGN_UP_DTO) => Promise<void>;
  signOut: () => Promise<void>;
  isFetchingDataInStorage: boolean;
  //   changeUserAvatar: (url: string) => Promise<void>;
};

type userAuthContextProviderProps = {
  children: ReactNode;
};

export const UserAuthContext = createContext({} as userAuthContextType);

export const UserAuthContextProvider = ({
  children,
}: userAuthContextProviderProps) => {
  const [user, setUser] = useState<USER_DTO | null>(null);
  const [isFetchingDataInStorage, setIsFetchingDataInStorage] = useState(true);

  async function signIn(props: SIGN_IN_DTO) {
    const { email, password } = props;
    try {
      const {
        access_token,
        refresh_token,
        user: userData,
      } = await signinService({ email, password });

      await SaveAuthTokensInLocalStorage({
        token: access_token,
        refreshToken: refresh_token,
      });
      saveApiTokenService(access_token);
      SaveUserInLocalStorage({
        email,
        id: userData.id,
        photo: userData.avatarUrl,
        name: userData.name,
      });
      setUser({
        email,
        id: userData.id,
        photo: userData.avatarUrl,
        name: userData.name,
      });
    } catch (error) {
      throw error;
    }
  }

  // async function signUp(props: SIGN_UP_DTO) {
  //     try {
  //         await signUpController(props);
  //     } catch (error) {
  //         throw error;
  //     }
  // }

  // async function handleSignOut() {
  //     try {
  //         await logout();
  //         setUser(null);
  //     } catch (error) {
  //         errorToastHandler({ error });
  //     } finally {
  //         router.replace("/(auth)/signIn" as any);
  //     }
  // }

  const fetchUserInformation = useCallback(async () => {
    setIsFetchingDataInStorage(true);
    try {
      const userLogged = await getUserInLocalStorage();
      const userToken = await getAuthTokensInLocalStorage();

      if (!userLogged.email || !userToken) return;

      setUser(userLogged);
      saveApiTokenService(userToken.token);
    } catch (error) {
      throw error;
    } finally {
      console.log("bateu fin");
      setIsFetchingDataInStorage(false);
    }
  }, []);

  async function handleSignOut() {
    try {
      //   await logout();
      setUser(null);
    } catch (error) {
      // errorToastHandler({ error });
    } finally {
      //   router.replace("/(auth)/signIn" as any);
    }
  }

  useEffect(() => {
    fetchUserInformation();
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        signIn,
        // signUp,

        signOut: handleSignOut,
        isFetchingDataInStorage,

        // changeUserAvatar,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
