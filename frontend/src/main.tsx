import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import '@mantine/core/styles.css';
import './style.css';
import { QuestScreen } from './quest/QuestScreen';

const rootRoute = createRootRoute();
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: QuestScreen });
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute]) });
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

const theme = createTheme({
  fontFamily: '"DM Sans", sans-serif',
  headings: { fontFamily: '"DM Sans", sans-serif' },
  primaryColor: 'violet',
  colors: { violet: ['#f2eeff', '#e5ddff', '#d5c5ff', '#b9a0ff', '#9677ff', '#7c55ff', '#6325e7', '#4d19c0', '#38129b', '#280c76'] },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
