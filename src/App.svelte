<script lang="ts">
  import Home from "./Home.svelte";
  import Login from "./Login.svelte";
  import SignUp from "./SignUp.svelte";
  import NotFound from "./NotFound.svelte";

  import Router from "svelte-spa-router";

  const routes = {
    "/": Home,
    "/login": Login,
    "/signup": SignUp,
    "*": NotFound,
  };
</script>

<main>
  <Router {routes} />
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
