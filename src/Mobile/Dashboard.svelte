<script lang="ts">
  import { mdiHome, mdiFileDocumentMultiple, mdiHospitalBox } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { replace } from "svelte-spa-router";

  import { userStore } from "../common-stores";
  import Loading from "../Loading.svelte";
  import Home from "../Mobile/Home.svelte";
  import Providers from "../Mobile/Providers.svelte";
  import VisitHistory from "../Mobile/VisitHistory.svelte";

  let tab = Home;
</script>

{#await $userStore}
  <Loading />
{:then user}
  {#if user !== null}
    <svelte:component this={tab} />

    <!-- svelte-ignore a11y-no-redundant-roles -->
    <nav class="navbar is-link is-fixed-bottom" role="navigation">
      <div class="navbar-brand">
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="navbar-item is-expanded is-block has-text-centered"
          on:click={() => (tab = Providers)}
        >
          <Icon path={mdiHospitalBox} />
          <p class="is-size-7">Providers</p>
        </a>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="navbar-item is-expanded is-block has-text-centered"
          on:click={() => (tab = Home)}
        >
          <Icon path={mdiHome} />
          <p class="is-size-7">Home</p>
        </a>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="navbar-item is-expanded is-block has-text-centered"
          on:click={() => (tab = VisitHistory)}
        >
          <Icon path={mdiFileDocumentMultiple} />
          <p class="is-size-7">Records</p>
        </a>
      </div>
    </nav>
  {:else}
    {replace("/login")}
  {/if}
{/await}
