import { NavigateFunction } from "react-router-dom";

let navigator: NavigateFunction | null = null;

export const setNavigator = (nav: NavigateFunction) => {
  navigator = nav;
};

export const navigateToLogin = () => {
  if (navigator) {
    console.log(1);
    navigator("/login", { replace: true });
  } else {
    console.error("Navigate function is not set.");
  }
};
