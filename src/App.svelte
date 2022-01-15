<script lang="ts">
  import Router from "svelte-spa-router";

  import Home from "./Home.svelte";
  import Login from "./Login.svelte";
  import SignUp from "./SignUp.svelte";
  import NotFound from "./NotFound.svelte";

  const routes = {
    "/": Home,
    "/login": Login,
    "/signup": SignUp,
    "*": NotFound,
  };
</script>

<main class="flex h-screen">
  <Router {routes} />
</main>
