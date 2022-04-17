<script lang="ts">
  import Icon from "mdi-svelte";
  import {
    mdiCheckDecagramOutline,
    mdiFaceRecognition,
    mdiHospitalMarker,
    mdiMagnify,
    mdiWindowClose,
  } from "@mdi/js";
  import { afterUpdate, onMount } from "svelte";
  import { link, push } from "svelte-spa-router";

  import { apiCall, bulma } from "../utils";
  import NoMatchingResults from "../NoMatchingResults.svelte";

  onMount(bulma);
  afterUpdate(bulma);

  let searching = false,
    patients = [],
    query: string,
    patient = null;

  function onInput() {
    var val = document.getElementById("patientSearchQuery").value;
    var opts = document.getElementById("patientsList").childNodes;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === val) {
        let patientID = opts[i].getAttribute("data-value");
        patient = patients.filter(
          (patient) => patient["uuid"] == patientID,
          patients
        )[0];
        break;
      }
    }
  }

  async function handleSearch() {
    searching = true;
    await apiCall(
      "index/patients/search/",
      "POST",
      (result) => {
        patients = result["data"];
      },
      (result) => {
        console.error(result);
      },
      JSON.stringify({ query })
    );
  }
</script>

<div class="container is-fluid">
  Patient
  <form on:submit|preventDefault={handleSearch} style="width: 100% !important;">
    <div class="field has-addons" style="width: 100% !important;">
      <div class="control" style="width: 100% !important;">
        <input
          bind:value={query}
          id="patientSearchQuery"
          class="input"
          list="patientsList"
          on:input={() => onInput()}
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
  </form>

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

  {#if patients.length == 0 && searching}
    <NoMatchingResults />
  {/if}

  {#if patient}
    {#if patient["national_id"]}
      <h1 class="title mt-4 mb-2">
        {patient["first_name"]}
        {patient["last_name"]} - {patient["national_id"]}
      </h1>
    {:else}
      <h1 class="title mt-2">{patient["first_name"]} {patient["last_name"]}</h1>
    {/if}

    <div class="tabs is-toggle is-fullwidth">
      <ul>
        <li class="tab is-active" id="biodataTab">
          <a>
            <span class="icon is-small"><Icon path={mdiFaceRecognition} /></span
            >
            <span>Biodata</span>
          </a>
        </li>
        <li class="tab" id="visitsTab">
          <a>
            <span class="icon is-small"><Icon path={mdiHospitalMarker} /></span>
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
            ><a href="/record-visit" use:link target="_blank">Start a Visit</a></button
          >
        </div>
      </div>
    </div>
  {/if}
</div>
