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
  primaryColor: 'teal',
  colors: { teal: ['#ecfaf9', '#d4f3f0', '#a8e6e0', '#79d5cf', '#48bcb7', '#209d9b', '#0b8082', '#0a666c', '#095158', '#083f49'] },
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
