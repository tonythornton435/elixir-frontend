<script lang="ts">
  import { Capacitor } from "@capacitor/core";
  import jwt_decode from "jwt-decode";
  import Router, { replace } from "svelte-spa-router";
  import { wrap } from "svelte-spa-router/wrap";

  import AccessDenied from "./AccessDenied.svelte";
  import Login from "./Login.svelte";
  import NotFound from "./NotFound.svelte";
  import SignUp from "./SignUp.svelte";
  import { getValue } from "./common-stores";
  import type { Token } from "./types";

  async function authenticationGuard(required_role: string) {
    const user = await getValue("user");
    if (user === null) {
      return false;
    }

    let token: Token = jwt_decode(user.token);
    return token.roles.includes(required_role);
  }

  function accessDenied(event) {
    replace("/access-denied");
  }

  let routes = {};
  if (Capacitor.isNativePlatform()) {
    routes = {
      "/": wrap({
        asyncComponent: () => import("./Mobile/Dashboard.svelte"),
        conditions: [async (detail) => authenticationGuard("PATIENT")],
      }),
      "/login": Login,
      "/signup": SignUp,
      "/access-denied": AccessDenied,
      "*": NotFound,
    };
  } else {
    routes = {
      "/": wrap({
        asyncComponent: () => import("./Desktop/Dashboard.svelte"),
        conditions: [async (detail) => authenticationGuard("PRACTITIONER")],
      }),
      "/patient": wrap({
        asyncComponent: () => import("./Desktop/Patient.svelte"),
        conditions: [async (detail) => authenticationGuard("PRACTITIONER")],
      }),
      "/record-visit": wrap({
        asyncComponent: () => import("./Desktop/RecordVisit.svelte"),
        conditions: [async (detail) => authenticationGuard("PRACTITIONER")],
      }),
      "/login": Login,
      "/signup": SignUp,
      "/practitioner-signup": wrap({
        asyncComponent: () => import("./Desktop/PractitionerSignUp.svelte"),
        conditions: [async (detail) => authenticationGuard("PATIENT")],
      }),
      "/access-denied": AccessDenied,
      "*": NotFound,
    };
  }
</script>

<main class="flex h-screen">
  <Router {routes} on:conditionsFailed={accessDenied} />
</main>
