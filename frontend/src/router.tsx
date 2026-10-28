import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { Container, Group, Text, Title } from "@mantine/core";
import { MoteKalender } from "./features/labyrint/components/MoteKalender";
import { KartSide } from "./features/labyrint/components/KartSide";
import { LabyrintSteg } from "./features/labyrint/components/LabyrintSteg";

const rootRoute = createRootRoute({
  component: () => (
    <Container size="md" py="xl">
      <Group gap="sm" mb="lg">
        <Text fz={40}>☕</Text>
        <div>
          <Title order={1}>Bjarnes møteromslabyrint</Title>
          <Text c="dimmed">Du finner ikke fram. Bjarne gjør det. Dessverre.</Text>
        </div>
      </Group>
      <Outlet />
    </Container>
  ),
});

const kalenderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: MoteKalender,
});

export const moteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mote/$moteId",
  component: KartSide,
});

// Issue #7: steg-for-steg-labyrinten
export const stegRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mote/$moteId/steg",
  validateSearch: (s: Record<string, unknown>): { blodsukker?: number } =>
    s.blodsukker === undefined ? {} : { blodsukker: Number(s.blodsukker) },
  component: LabyrintSteg,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([kalenderRoute, moteRoute, stegRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
