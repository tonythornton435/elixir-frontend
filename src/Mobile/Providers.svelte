<script lang="ts">
  import {
    mdiBaby,
    mdiDoctor,
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

  import { INDEX_API_BASE_URL } from "../constants";
  import { apiCall, bulma } from "../utils";

  export let tab = this;

  let query: string,
    searching = false,
    facilities = [],
    practitioners = [],
    allActive = true,
    facilitiesActive = false,
    practitionersActive = false;

  apiCall(INDEX_API_BASE_URL + "index/facilities/", "GET", (result) => {
    facilities = result["data"];
  });

  apiCall(INDEX_API_BASE_URL + "index/practitioners/", "GET", (result) => {
    practitioners = result["data"];
    console.log(practitioners);
  });

  onMount(bulma);
  afterUpdate(bulma);

  async function handleSearch() {
    searching = true;
    await apiCall(
      INDEX_API_BASE_URL + "index/facilities/search/",
      "POST",
      (result) => {
        facilities = result["data"];
      },
      { query }
    );
    await apiCall(
      INDEX_API_BASE_URL + "index/practitioners/search/",
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
      <a
        class:is-active={allActive}
        on:click={() => {
          allActive = true;
          facilitiesActive = false;
          practitionersActive = false;
        }}>All</a
      >
      <!-- svelte-ignore a11y-missing-attribute -->
      <a
        class:is-active={facilitiesActive}
        on:click={() => {
          allActive = false;
          facilitiesActive = true;
          practitionersActive = false;
        }}>Facilities</a
      >
      <!-- svelte-ignore a11y-missing-attribute -->
      <a
        class:is-active={practitionersActive}
        on:click={() => {
          allActive = false;
          facilitiesActive = false;
          practitionersActive = true;
        }}>Practitioners</a
      >
    </p>
    {#if facilities.length + practitioners.length > 0 || !searching}
      {#if allActive || facilitiesActive}
        {#each facilities as facility}
          <div id={facility["uuid"]} class="modal">
            <div class="modal-background" />
            <div class="modal-card">
              <header class="modal-card-head">
                <p class="modal-card-title">
                  {facility["name"]} Contact Details
                </p>
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
          <a
            class="panel-block js-modal-trigger"
            data-target={facility["uuid"]}
          >
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
      {/if}

      {#if allActive || practitionersActive}
        {#each practitioners as practitioner}
          <div id={practitioner["uuid"]} class="modal">
            <div class="modal-background" />
            <div class="modal-card">
              <header class="modal-card-head">
                <p class="modal-card-title">
                  {practitioner["user"]["first_name"]}
                  {practitioner["user"]["last_name"]} Contact Details
                </p>
                <button class="delete" aria-label="close" />
              </header>
              <section class="modal-card-body">
                <span class="icon-text is-italic">
                  <span class="icon">
                    <Icon path={mdiDoctor} />
                  </span>
                  <span>{practitioner["type"]}</span>
                </span>
                <br />
                <span class="icon-text is-italic">
                  <span class="icon">
                    <Icon path={mdiMapMarker} />
                  </span>
                  <span
                    >{practitioner["latest_tenure"]["facility"]["name"]}</span
                  >
                </span>
                <br />
                <span class="icon-text">
                  <span class="icon">
                    <Icon path={mdiPhone} />
                  </span>
                  <span>{practitioner["user"]["phone_number"]}</span>
                </span>
                <br />
                <span class="icon-text">
                  <span class="icon">
                    <Icon path={mdiEmail} />
                  </span>
                  <span>{practitioner["user"]["email"]}</span>
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
          <a
            class="panel-block js-modal-trigger"
            data-target={practitioner["uuid"]}
          >
            <span class="icon-text">
              <span class="icon">
                <Icon path={mdiDoctor} />
              </span>
              <span
                >{practitioner["user"]["first_name"]}
                {practitioner["user"]["last_name"]}</span
              >
            </span>
          </a>
        {/each}
      {/if}
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
