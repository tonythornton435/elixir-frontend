<script lang="ts">
  import { replace } from "svelte-spa-router";

  import { user } from "./stores";

  function logout() {
    $user = null;
  }
</script>

{#if $user !== null}
  <main>
    <h2>
      You are logged in <button type="button" on:click={logout}>Log Out</button>
    </h2>
    <pre>
          {JSON.stringify($user, null, 2)}
      </pre>
  </main>
{:else}
  {replace("/login")}
{/if}
