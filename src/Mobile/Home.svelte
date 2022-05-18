<script lang="ts">
  import { mdiExitRun } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import { get } from "svelte/store";

  import { storeValue, userStore, visitRecordStore } from "../common-stores";
  import { INDEX_API_BASE_URL } from "../constants";
  import Visit from "../Visit.svelte";
  import { apiCall, bulma, logout, toDateString } from "../utils";

  export let tab = this;

  let accessRequests = [],
    user;

  async function updateRequests() {
    await apiCall(
      INDEX_API_BASE_URL +
        `index/records/users/${user["user"]["uuid"]}/consent/`,
      "GET",
      (result) => {
        accessRequests = result["data"];
        console.log(result);
      }
    );
  }

  async function updateRequestStatus(accessRequestUUID, to_state) {
    await apiCall(
      INDEX_API_BASE_URL + `index/records/consent/${accessRequestUUID}/update/`,
      "POST",
      (result) => {
        updateRequests();
        console.log(result);
      },
      {
        to_state,
      }
    );
  }

  async function viewRecord(recordUUID) {
    await apiCall(
      INDEX_API_BASE_URL + `index/records/${recordUUID}/`,
      "GET",
      (result) => {
        let visitRecord = result["data"];
        visitRecord["rating"] = visitRecord["rating"]
          .split(",")
          .map((x) => Number.parseFloat(x));
        storeValue(visitRecordStore, "visit-record", visitRecord);
        tab = Visit;
        console.log(result);
      }
    );
  }

  onMount(async () => {
    bulma();
    user = await get(userStore);
    updateRequests();
  });
  afterUpdate(bulma);
</script>

{#if user}
  <div class="container is-fluid mt-6">
    <div class="columns is-flex is-centered">
      <figure class="image">
        <img
          src="/assets/undraw_profile_pic_ic-5-t.svg"
          alt="Signup welcome"
          style="width:128px;height:auto;"
        />
      </figure>
    </div>
    <div class="mt-2 columns is-flex is-centered has-text-weight-bold">
      {user["user"]["first_name"]}
      {user["user"]["last_name"]}
    </div>
    <div class="columns is-flex is-centered">
      <button class="button is-info" on:click={logout}>
        <span>Logout</span>
        <span class="icon is-small">
          <Icon path={mdiExitRun} />
        </span>
      </button>
    </div>

    <!--Access Requests-->
    <p class="is-size-4 mt-2">Access Requests</p>
    <div
      class="list has-visible-pointer-controls has-hoverable-list-items has-overflow-ellipsis"
    >
      {#each accessRequests as accessRequest}
        <div class="list-item no-padding">
          <div class="list-item-content">
            <div class="list-item-title">
              {toDateString(accessRequest.created, true)}
            </div>
            <div class="list-item-description">
              {accessRequest.requestor.practitioner.user.first_name}
              {accessRequest.requestor.practitioner.user.last_name}
              <p style="white-space: pre-wrap;">{accessRequest.request_note}</p>
            </div>
          </div>

          <div class="list-item-controls">
            {#if accessRequest.status == "PENDING"}
              <div class="tags are-normal">
                <span
                  class="tag is-info js-modal-trigger"
                  data-target={`access-approval-modal-${accessRequest.uuid}`}
                  >PENDING</span
                >
                <span
                  class="tag is-dark"
                  on:click={() => viewRecord(accessRequest.record_id)}
                  >View</span
                >
              </div>
              <div
                class="modal"
                id={`access-approval-modal-${accessRequest.uuid}`}
              >
                <div class="modal-background" />
                <div class="modal-card">
                  <header class="modal-card-head">
                    <p class="modal-card-title">Confirm</p>
                    <button class="delete" aria-label="close" />
                  </header>
                  <section class="modal-card-body">Approve access?</section>
                  <footer class="modal-card-foot">
                    <button
                      class="button is-success"
                      on:click={async () =>
                        updateRequestStatus(accessRequest.uuid, "APPROVED")}
                      >Approve</button
                    >
                    <button class="button">Cancel</button>
                  </footer>
                </div>
              </div>
            {:else if accessRequest.status == "APPROVED"}
              <div class="tags are-normal">
                <span
                  class="tag is-success js-modal-trigger"
                  data-target={`access-withdrawal-modal-${accessRequest.uuid}`}
                  >GRANTED</span
                >
                <span
                  class="tag is-dark"
                  on:click={() => viewRecord(accessRequest.record_id)}
                  >View</span
                >
                <div
                  class="modal"
                  id={`access-withdrawal-modal-${accessRequest.uuid}`}
                >
                  <div class="modal-background" />
                  <div class="modal-card">
                    <header class="modal-card-head">
                      <p class="modal-card-title">Confirm</p>
                      <button class="delete" aria-label="close" />
                    </header>
                    <section class="modal-card-body">Withdraw access?</section>
                    <footer class="modal-card-foot">
                      <button
                        class="button is-success"
                        on:click={async () =>
                          updateRequestStatus(accessRequest.uuid, "WITHDRAWN")}
                        >Withdraw</button
                      >
                      <button class="button">Cancel</button>
                    </footer>
                  </div>
                </div>
              </div>
            {:else}
              <div class="tags are-normal">
                <span class="tag is-warning">WITHDRAWN</span>
                <span
                  class="tag is-dark"
                  on:click={() => viewRecord(accessRequest.record_id)}
                  >View</span
                >
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
