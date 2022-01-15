<script lang="ts">
  import { replace } from "svelte-spa-router";
  import { Storage } from "@capacitor/storage";

  import { user } from "./stores";
  import Loading from "./Loading.svelte";
  console.log(user);

  async function logout() {
    await Storage.remove({ key: "user" });
    $user = null;
  }
</script>

{#await $user}
  <Loading />
{:then user}
  {#if user !== null}
    <div class="m-auto">
      <h2>
        You are logged in <button type="button" on:click={logout}
          >Log Out</button
        >
      </h2>
      <p>
        {JSON.stringify(user, null, 2)}
      </p>
    </div>
  {:else}
    {replace("/login")}
  {/if}
{/await}
