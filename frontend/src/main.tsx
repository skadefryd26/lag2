import "@mantine/core/styles.css";
import "./app.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

const theme = createTheme({
  primaryColor: "kaffe",
  fontFamily: "Inter, sans-serif",
  headings: { fontFamily: "Fredoka, sans-serif" },
  defaultRadius: "lg",
  colors: {
    kaffe: ["#fbf3ea", "#f1e1cc", "#e3c19a", "#d5a066", "#c9843b", "#c07322", "#a85f14", "#8a4d10", "#6f3d0b", "#542d06"],
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
