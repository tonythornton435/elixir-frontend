<script lang="ts">
  import { mdiCalendar, mdiDoctor, mdiHospitalBuilding } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { push } from "svelte-spa-router";
  import { afterUpdate, onMount } from "svelte";

  import { apiCall, bulma } from "../utils";

  onMount(bulma);
  afterUpdate(bulma);

  let facilities = [],
    practitionerType,
    tenureStart,
    facilityID,
    saveFailed = false;

  apiCall(
    "index/facilities/",
    "GET",
    (result) => {
      facilities = result["data"];
    },
    (result) => console.log(result)
  );

  async function handleSubmit() {}
</script>

<div class="container is-fluid mt-6 mb-4">
  <form on:submit|preventDefault={handleSubmit}>
    {#if saveFailed}
      <div class="notification is-danger">Failed. Please try again.</div>
    {/if}

    <div class="field">
      <label class="label" for="practitionerType">Practitioner Type</label>
      <div class="control has-icons-left">
        <div class="select">
          <select bind:value={practitionerType} id="practitionerType" required>
            <option value="PHYSICIAN">Physician</option>
            <option value="NURSE">Nurse</option>
            <option value="LAB_TECHNICIAN">Lab Technician</option>
            <option value="SURGEON">Surgeon</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="DENTIST">Dentist</option>
            <option value="OPTICIAN">Optician</option>
          </select>
        </div>
        <span class="icon is-small is-left">
          <Icon path={mdiDoctor} />
        </span>
      </div>
    </div>

    <div class="field">
      <label class="label" for="facilityID">Health Facility</label>
      <div class="control has-icons-left">
        <div class="select">
          <select bind:value={facilityID} id="facilityID" required>
            {#if facilities.length > 0}
              {#each facilities as facility}
                <option value={facility["uuid"]}>{facility["name"]}</option>
              {/each}
            {/if}
          </select>
        </div>
        <span class="icon is-small is-left">
          <Icon path={mdiHospitalBuilding} />
        </span>
      </div>
    </div>

    <div class="field">
      <label class="label" for="tenureStart">Tenure Start</label>
      <div class="control has-icons-left">
        <input
          bind:value={tenureStart}
          class="input"
          type="date"
          id="tenureStart"
          placeholder="Select a date"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiCalendar} />
        </span>
      </div>
    </div>
  </form>
</div>
