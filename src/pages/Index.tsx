import { Navigate } from "react-router-dom";

export const HomeRedirect = () => {
  const token = localStorage.getItem("accessToken");
  const userType = localStorage.getItem("userType");

  if (token) {
    return (
      <Navigate
        to={userType === "parent" ? "/dashboard" : "/chat"}
        replace
      />
    );
  }

};