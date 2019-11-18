import { lazy } from 'react';

const Home = lazy(() => import('@/pages/home'));

const routes = [
  {
    path: '/',
    exact: true,
    title: '首页',
    component: Home
  },
  {
    path: '/h5/home',
    exact: true,
    title: '首页',
    component: Home
  }
];

export default routes;
