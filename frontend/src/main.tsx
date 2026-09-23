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
  headings: { fontFamily: '"Fraunces", Georgia, serif' },
  primaryColor: 'orange',
  colors: { orange: ['#fff4e6', '#ffe3bd', '#ffd49d', '#ffc278', '#ffad51', '#ee9238', '#d47725', '#aa5c20', '#81481c', '#613619'] },
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
