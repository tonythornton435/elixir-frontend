<script lang="ts">
  import { Capacitor } from "@capacitor/core";
  import Router from "svelte-spa-router";

  import MobileDashboard from "./Mobile/Dashboard.svelte";
  import DesktopDashboard from "./Desktop/Dashboard.svelte";
  import Login from "./Login.svelte";
  import SignUp from "./SignUp.svelte";
  import NotFound from "./NotFound.svelte";

  let routes;

  if (Capacitor.isNativePlatform()) {
    routes = {
      "/": MobileDashboard,
      "/login": Login,
      "/signup": SignUp,
      "*": NotFound,
    };
  } else {
    routes = {
      "/": DesktopDashboard,
      "/login": Login,
      "/signup": SignUp,
      "*": NotFound,
    };
  }
</script>

<main class="flex h-screen">
  <Router {routes} />
</main>
