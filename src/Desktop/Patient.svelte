<script lang="ts">
  import {
    mdiCheckDecagramOutline,
    mdiFaceRecognition,
    mdiHospitalMarker,
    mdiMagnify,
    mdiWindowClose,
  } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import { link } from "svelte-spa-router";

  import { storeValue } from "../common-stores";
  import NoMatchingResults from "../NoMatchingResults.svelte";
  import { patientStore } from "./stores";
  import { apiCall, bulma, onInputSearchDataList } from "../utils";

  onMount(bulma);
  afterUpdate(bulma);

  let searching = false,
    patients = [],
    query: string;
</script>

<div class="container is-fluid">
  Patient
  <form
    on:submit|preventDefault={async () => {
      searching = true;
      await apiCall(
        "index/patients/search/",
        "POST",
        (result) => {
          patients = result["data"];
        },
        { query }
      );
    }}
    style="width: 100% !important;"
  >
    <div class="field has-addons" style="width: 100% !important;">
      <div class="control" style="width: 100% !important;">
        <input
          bind:value={query}
          id="patientSearchQuery"
          class="input"
          list="patientsList"
          on:input={() =>
            onInputSearchDataList(
              "patientSearchQuery",
              "patientsList",
              (data_value) => {
                storeValue(
                  patientStore,
                  "patient",
                  patients.filter(
                    (patient) => patient["uuid"] == data_value,
                    patients
                  )[0]
                );
              }
            )}
          placeholder="Search Patient"
          autocomplete="off"
          required
        />
      </div>
      <div class="control">
        <button class="button is-link" type="submit">
          <Icon path={mdiMagnify} />
        </button>
      </div>
    </div>

    <datalist id="patientsList">
      {#if patients.length > 0}
        {#each patients as patientObj}
          <option
            data-value={patientObj["uuid"]}
            value="{patientObj['first_name']} {patientObj[
              'last_name'
            ]} - {patientObj['email']} ({patientObj['national_id']})"
          />
          >
        {/each}
      {/if}
    </datalist>
  </form>

  {#if patients.length == 0 && searching}
    <NoMatchingResults />
  {/if}

  {#await $patientStore then patient}
    {#if patient}
      {#if patient["national_id"]}
        <h1 class="title mt-4 mb-2">
          {patient["first_name"]}
          {patient["last_name"]} - {patient["national_id"]}
        </h1>
      {:else}
        <h1 class="title mt-2 mb-2">
          {patient["first_name"]}
          {patient["last_name"]}
        </h1>
      {/if}

      <div class="tabs is-toggle is-fullwidth">
        <ul>
          <li class="tab is-active" id="biodataTab">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a>
              <span class="icon is-small"
                ><Icon path={mdiFaceRecognition} /></span
              >
              <span>Biodata</span>
            </a>
          </li>
          <li class="tab" id="visitsTab">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a>
              <span class="icon is-small"
                ><Icon path={mdiHospitalMarker} /></span
              >
              <span>Visits</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="column is-12 tabs-content">
        <div id="biodataTab-content">
          <div class="columns mb-0 has-text-weight-bold">
            <div class="column">
              <p>General</p>
            </div>
          </div>
          <div class="columns">
            <div class="column is-quarter has-background-light">
              <p class="py-1">First Name</p>
              <p class="silver-separator py-1">Gender</p>
              <p class="silver-separator py-1">National ID</p>
            </div>
            <div class="column is-quarter">
              <p class="py-1">{patient["first_name"]}</p>
              <p class="silver-separator py-1">{patient["gender"]}</p>
              <p class="silver-separator py-1">{patient["national_id"]}</p>
            </div>
            <div class="column is-quarter has-background-light">
              <p class="py-1">Last Name</p>
              <p class="silver-separator py-1">Date Of Birth</p>
              <p class="silver-separator py-1">UUID</p>
            </div>
            <div class="column is-quarter">
              <p class="py-1">{patient["last_name"]}</p>
              <p class="silver-separator py-1">{patient["date_of_birth"]}</p>
              <p class="silver-separator py-1 is-size-7">{patient["uuid"]}</p>
            </div>
          </div>

          <div class="columns mb-0 has-text-weight-bold">
            <div class="column">
              <p>Contacts</p>
            </div>
          </div>
          <div class="columns">
            <div class="column is-quarter has-background-light">
              <p>Email</p>
            </div>
            <div class="column is-quarter">
              <p>{patient["email"]}</p>
            </div>
            <div class="column is-quarter has-background-light">
              <p>Phone Number</p>
            </div>
            <div class="column is-quarter">
              <p>{patient["phone_number"]}</p>
            </div>
          </div>

          <div class="columns mb-0 has-text-weight-bold">
            <div class="column">
              <p>Status</p>
            </div>
          </div>
          <div class="columns">
            <div class="column is-quarter has-background-light">
              <p>Date Joined</p>
            </div>
            <div class="column is-quarter">
              <p>{patient["date_joined"]}</p>
            </div>
            <div class="column is-quarter has-background-light">
              <p>Is Active</p>
            </div>
            <div class="column is-quarter">
              {#if patient["is_active"]}
                <p><Icon path={mdiCheckDecagramOutline} /></p>
              {:else}
                <p><Icon path={mdiWindowClose} /></p>
              {/if}
            </div>
          </div>
        </div>

        <div id="visitsTab-content" class="is-hidden">
          <div class="buttons">
            <button class="button is-link is-light"
              ><a href="/record-visit" use:link>Start a Visit</a></button
            >
          </div>
        </div>
      </div>
      {bulma()}
    {/if}
  {/await}
</div>
