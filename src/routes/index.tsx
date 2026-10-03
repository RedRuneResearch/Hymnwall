import { createFileRoute } from "@tanstack/react-router";
import { HymnwallApp } from "../components/hymnwall-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HymnwallApp />;
}
