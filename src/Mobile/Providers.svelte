<script lang="ts">
  import {
    mdiBaby,
    mdiEmail,
    mdiEmailFast,
    mdiFlask,
    mdiGlasses,
    mdiHospitalBuilding,
    mdiMagnify,
    mdiMapMarker,
    mdiPhone,
    mdiPill,
    mdiThumbUpOutline,
    mdiTooth,
  } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";

  import { apiCall, bulma } from "../utils";

  export let tab = this;

  let query: string,
    searching = false,
    facilities = [],
    practitioners = [];

  apiCall("index/facilities/", "GET", (result) => {
    console.log(result);
    facilities = result["data"];
  });

  apiCall("index/practitioners/", "GET", (result) => {
    console.log(result);
    practitioners = result["data"];
  });

  onMount(bulma);
  afterUpdate(bulma);

  async function handleSearch() {
    searching = true;
    await apiCall(
      "index/facilities/search/",
      "POST",
      (result) => {
        facilities = result["data"];
      },
      { query }
    );
    await apiCall(
      "index/practitioners/search/",
      "POST",
      (result) => {
        practitioners = result["data"];
      },
      { query }
    );
  }
</script>

<div class="container">
  <nav class="panel">
    <p class="panel-heading">Providers</p>
    <div class="panel-block">
      <form
        on:submit|preventDefault={handleSearch}
        style="width: 100% !important;"
      >
        <div class="field has-addons" style="width: 100% !important;">
          <div class="control" style="width: 100% !important;">
            <input
              bind:value={query}
              id="providerSearchQuery"
              class="input"
              type="text"
              placeholder="Search Provider"
              required
            />
          </div>
          <div class="control">
            <button class="button is-link" type="submit">
              <Icon path={mdiMagnify} />
            </button>
          </div>
        </div>
      </form>
    </div>
    <p class="panel-tabs">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="is-active">All</a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>Clinics</a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>Practitioners</a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>Pharmacies</a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>Labs</a>
      <!-- svelte-ignore a11y-missing-attribute -->
      <a>Other</a>
    </p>
    {#if facilities.length + practitioners.length > 0 || !searching}
      {#each facilities as facility}
        <div id={facility["uuid"]} class="modal">
          <div class="modal-background" />
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">{facility["name"]} Contact Details</p>
              <button class="delete" aria-label="close" />
            </header>
            <section class="modal-card-body">
              <span class="icon-text is-italic">
                <span class="icon">
                  <Icon path={mdiEmailFast} />
                </span>
                <span>{facility["address"]}</span>
              </span>
              <br />
              <span class="icon-text is-italic">
                <span class="icon">
                  <Icon path={mdiMapMarker} />
                </span>
                <span>{facility["location"]}, {facility["county"]}</span>
              </span>
              <br />
              <span class="icon-text">
                <span class="icon">
                  <Icon path={mdiPhone} />
                </span>
                <span>{facility["phone_number"]}</span>
              </span>
              <br />
              <span class="icon-text">
                <span class="icon">
                  <Icon path={mdiEmail} />
                </span>
                <span>{facility["email"]}</span>
              </span>
            </section>
            <footer class="modal-card-foot">
              <button class="button is-link">
                <span class="icon is-small">
                  <Icon path={mdiThumbUpOutline} />
                </span>
                <span>Got it!</span>
              </button>
            </footer>
          </div>
        </div>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="panel-block js-modal-trigger" data-target={facility["uuid"]}>
          <span class="icon-text">
            <span class="icon">
              {#if facility["type"] == "MBL"}
                <Icon path={mdiFlask} />
              {:else if facility["type"] == "PHARM"}
                <Icon path={mdiPill} />
              {:else if facility["type"] == "PEDC"}
                <Icon path={mdiBaby} />
              {:else if facility["type"] == "OPTC"}
                <Icon path={mdiGlasses} />
              {:else if facility["type"] == "DENT"}
                <Icon path={mdiTooth} />
              {:else}
                <!--HOSP, PSY, RH-->
                <Icon path={mdiHospitalBuilding} />
              {/if}
            </span>
            <span>{facility["name"]}</span>
          </span>
        </a>
      {/each}
    {:else}
      <div class="w-full">
        <div class="flex items-center justify-center">
          <img
            src="/assets/undraw_notify_re_65on.svg"
            class="px-8 my-4 w-full max-w-lg"
            alt="Notify"
          />
        </div>
        <div class="flex items-center justify-center">
          <p>No matching results!</p>
        </div>
      </div>
    {/if}
  </nav>
</div>
