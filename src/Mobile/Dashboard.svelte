<script lang="ts">
  import { replace } from "svelte-spa-router";
  import Icon from "mdi-svelte";
  import { mdiHome, mdiFileDocumentMultiple, mdiHospitalBox } from "@mdi/js";

  import { user } from "../stores";
  import Loading from "../Loading.svelte";
  import Home from "../Mobile/Home.svelte";
  import Providers from "../Mobile/Providers.svelte";
  import VisitHistory from "../Mobile/VisitHistory.svelte";

  let tab = Home;
</script>

{#await $user}
  <Loading />
{:then user}
  {#if user !== null}
    <svelte:component this={tab} />

    <section class="block fixed inset-x-0 bottom-0 z-10 bg-white shadow">
      <div class="flex justify-between">
        <div class="w-full justify-center inline-block text-center pt-2 pb-1" on:click={() => tab=Providers}>
          <div class="inline-block">
            <Icon path={mdiHospitalBox} />
          </div>
          <span class="tab tab-home block text-xs">Providers</span>
        </div>
        <div class="w-full justify-center inline-block text-center pt-2 pb-1" on:click={() => tab=Home}>
          <div class="inline-block"><Icon path={mdiHome} color="black" /></div>
          <span class="tab tab-home block text-xs">Home</span>
        </div>
        <div class="w-full justify-center inline-block text-center pt-2 pb-1" on:click={() => tab=VisitHistory}>
          <div class="inline-block">
            <Icon path={mdiFileDocumentMultiple} />
          </div>
          <span class="tab tab-home block text-xs">Visit History</span>
        </div>
      </div>
    </section>
  {:else}
    {replace("/login")}
  {/if}
{/await}
