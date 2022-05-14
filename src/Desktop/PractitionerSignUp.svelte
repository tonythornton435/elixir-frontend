<script lang="ts">
  import {
    mdiCalendar,
    mdiCheckAll,
    mdiDoctor,
    mdiHospitalBuilding,
  } from "@mdi/js";
  import { toast } from "bulma-toast";
  import Icon from "mdi-svelte";
  import { onMount } from "svelte";
  import { link, push } from "svelte-spa-router";

  import { getValue } from "../common-stores";
  import { apiCall } from "../utils";

  let facilities = [],
    practitionerType,
    tenureStart,
    facilityID,
    user;

  onMount(async () => {
    user = await getValue("user");
    await apiCall("index/facilities/", "GET", (result) => {
      facilities = result["data"];
    });
  });
</script>

<div class="columns is-flex is-centered">
  <figure class="image">
    <img
      src="/assets/undraw_doctor_kw-5-l.svg"
      alt="Doctor"
      style="width:256px;height:auto;"
    />
  </figure>
</div>

<div class="container is-fluid mt-6 mb-4">
  <form
    on:submit|preventDefault={async () => {
      await apiCall(
        "index/practitioners/new/",
        "POST",
        (result) => {
          push("/login");
        },
        {
          user_id: user["user"]["uuid"],
          type: practitionerType,
          employment_history: [
            {
              facility_id: facilityID,
              start: tenureStart,
            },
          ],
        },
        () => {
          toast({
            message: "Failed. Please try again",
            type: "is-danger",
            dismissible: true,
            pauseOnHover: true,
            position: "top-center",
            duration: 4000,
          });
        }
      );
    }}
  >
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

    <div class="field is-grouped is-grouped-centered mt-4">
      <div class="control">
        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiCheckAll} />
          </span>
          <span>Sign Up</span>
        </button>
      </div>
      <div class="control">
        <button class="button is-link is-light">
          <a href="/login" use:link>Login</a>
        </button>
      </div>
    </div>
  </form>
</div>
