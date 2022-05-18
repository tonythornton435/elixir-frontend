<script lang="ts">
  import { mdiEyeCheck } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import StarRating from "svelte-star-rating";

  import { getValue, storeValue, visitRecordStore } from "../common-stores";
  import { INDEX_API_BASE_URL } from "../constants";
  import { apiCall, bulma, toDateString } from "../utils";
  import Visit from "../Visit.svelte";

  export let tab = this;

  let user,
    patient,
    records = [];

  onMount(async () => {
    bulma();
    user = await getValue("user");
    patient = user.user;
    console.log(patient, user);
    apiCall(
      INDEX_API_BASE_URL + `index/records/users/${patient["uuid"]}/`,
      "GET",
      (result) => {
        records = [];
        for (let record of result["data"]) {
          record["rating"] = record["rating"]
            .split(",")
            .map((x) => Number.parseFloat(x));
          records.push(record);
        }
        console.log(records);
      }
    );
  });
  afterUpdate(bulma);
</script>

<div class="is-fluid">
  {#if patient}
    <h1 class="is-family-monospace is-uppercase mt-1 mb-1">
      {patient["first_name"]}
      {patient["last_name"]}
    </h1>

    <div class="column is-12">
      <div
        class="list has-visible-pointer-controls has-hoverable-list-items has-overflow-ellipsis"
      >
        {#each records as record}
          <div class="list-item no-padding">
            <div class="list-item-content">
              <div class="list-item-title">
                {toDateString(record.creation_time, true)}
              </div>
              <div class="list-item-description">
                {record.visit_type} visit @ {record.facility.name}
                <StarRating
                  rating={(record.rating[0] + record.rating[1]) / 2}
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
  {/if}
</div>
