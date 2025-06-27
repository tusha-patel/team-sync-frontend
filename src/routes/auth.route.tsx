// import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
// import useAuth from "@/hooks/api/use-auth";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { isAuthRoute } from "./common/routePaths";

import { Outlet } from "react-router-dom";


// import { Navigate, Outlet } from "react-router-dom";

const AuthRoute = () => {
  // const { data: authData } = useAuth();
  // const user = authData?.user;
  // console.log(user);

  // return user ? <Navigate to={`/workspace/${user?.currentWorkspace?._id}`} /> : <Outlet />

  return <Outlet />

};

export default AuthRoute;