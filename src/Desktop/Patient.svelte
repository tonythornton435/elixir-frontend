<script lang="ts">
  import {
    mdiCheckDecagramOutline,
    mdiEyeCheck,
    mdiEyeRemove,
    mdiFaceRecognition,
    mdiHospitalMarker,
    mdiMagnify,
    mdiWindowClose,
  } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import { Shadow } from "svelte-loading-spinners";
  import StarRating from "svelte-star-rating";

  import { getValue, storeValue } from "../common-stores";
  import RecordVisit from "./RecordVisit.svelte";
  import { patientStore, visitRecordStore } from "./stores";
  import {
    apiCall,
    bulma,
    delay,
    onInputSearchDataList,
    toDateString,
  } from "../utils";
  import Visit from "./Visit.svelte";

  export let tab = this;

  let patient,
    records = [],
    fetch_records = true;

  onMount(async () => {
    bulma();
    patient = await getValue("patient");
  });
  afterUpdate(bulma);

  $: {
    if (patient && fetch_records) {
      apiCall(`index/records/users/${patient["uuid"]}`, "GET", (result) => {
        records = [];
        for (let record of result["data"]) {
          record["rating"] = Number.parseFloat(record["rating"]);
          records.push(record);
        }
        fetch_records = false;
        console.log(records);
      });
    }
  }

  let searching = false,
    patients = [],
    query: string;
</script>

<div class="container is-fluid">
  <form
    on:submit|preventDefault={async () => {
      patient = null;
      searching = true;
      records = [];
      fetch_records = true;
      await delay(2);
      await apiCall(
        "index/patients/search/",
        "POST",
        (result) => {
          patients = result["data"];
          searching = false;
        },
        { query }
      );
    }}
    style="width: 100% !important;"
    class="mt-3"
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
                patient = patients.filter(
                  (patient) => patient["uuid"] == data_value,
                  patients
                )[0];
                storeValue(patientStore, "patient", patient);
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

  {#if searching}
    <div class="mt-6 ml-6">
      <Shadow size="60" color="#1c71d8" unit="px" duration="1s" />
    </div>
  {:else if patient}
    {#if patient["national_id"]}
      <h1 class="is-family-monospace is-uppercase is-size-4 mt-4 mb-2">
        {patient["first_name"]}
        {patient["last_name"]} - {patient["national_id"]}
      </h1>
    {:else}
      <h1 class="is-family-monospace is-uppercase is-size-4 mt-2 mb-2">
        {patient["first_name"]}
        {patient["last_name"]}
      </h1>
    {/if}

    <div class="tabs is-toggle is-fullwidth">
      <ul>
        <li class="tab is-active" id="biodataTab">
          <!-- svelte-ignore a11y-missing-attribute -->
          <a>
            <span class="icon is-small"><Icon path={mdiFaceRecognition} /></span
            >
            <span>Biodata</span>
          </a>
        </li>
        <li class="tab" id="visitsTab">
          <!-- svelte-ignore a11y-missing-attribute -->
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
          <button class="button is-info" on:click={() => (tab = RecordVisit)}
            >Start a Visit</button
          >
        </div>

        <div
          class="list has-visible-pointer-controls has-hoverable-list-items has-overflow-ellipsis"
        >
          {#each records as record}
            <div class="list-item">
              <div class="list-item-content">
                <div class="list-item-title">
                  {toDateString(record.creation_time)}
                </div>
                <div class="list-item-description">
                  {record.visit_type} visit @ {record.facility.name}
                  <StarRating
                    rating={record.rating}
                    config={{ showText: true }}
                  />
                </div>
              </div>

              <div class="list-item-controls">
                <div class="buttons is-right">
                  <button
                    class="button"
                    on:click={() => {
                      storeValue(visitRecordStore, "visit-record", record);
                      tab = Visit;
                    }}
                  >
                    <span class="icon is-small">
                      <Icon path={mdiEyeCheck} />
                    </span>
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if patients.length == 0}
    <img
      src="/assets/undraw_notify_re_65on.svg"
      class="px-8 my-4 w-full max-w-lg"
      alt="Notify"
      style="width:256px;height:256px;"
    />
    <p class="has-text-weight-bold">No matching results!</p>
  {/if}
</div>
