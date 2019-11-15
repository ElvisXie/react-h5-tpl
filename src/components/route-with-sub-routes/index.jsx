import React, { lazy, Suspense } from "react";
import { Route, Redirect } from "react-router-dom";
import Cookie from "js-cookie";
import Loading from "@/components/loading";

// const Login = lazy(() => import("@/pages/login"));

const RouteWithSubRoutes = route => (
  <Route
    path={route.path}
    exact={route.exact}
    render={props => {
      document.title = route.title;
      // 判断是否需要重定向，优先级最高
      if (route.redirect) {
        return <Redirect to={route.redirect} />;
      }

      // 判断是否需要鉴权
      // if (route.isAuth) {
      //   const token = Cookie.get("x-auth-token");

      //   return !token ? (
      //     <Suspense fallback={<Loading />}>
      //       <Login {...props} />
      //     </Suspense>
      //   ) : (
      //     <route.component {...props} routes={route.routes} />
      //   );
      // }

      // 登录界面特殊处理，已登录状态下重定向回首页
      if (route.path === "/login") {
        const token = Cookie.get("x-auth-token");

        return token ? (
          <Redirect to="/" />
        ) : (
          <Suspense fallback={<Loading />}>
            <route.component {...props} routes={route.routes} />
          </Suspense>
        );
      }

      return (
        <Suspense fallback={<Loading />}>
          <route.component {...props} routes={route.routes} />
        </Suspense>
      );
    }}
  />
);

export default RouteWithSubRoutes;
