<script lang="ts">
  import { mdiExitRun } from "@mdi/js";
  import Icon from "mdi-svelte";
  import QRCode from "qrcode";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  import { userStore } from "../common-stores";
  import { apiCall, logout, toDateString } from "../utils";

  let accessRequests = [];

  onMount(async () => {
    let user = await get(userStore);
    QRCode.toCanvas(
      document.getElementById("qr-code"),
      user["user"]["uuid"],
      function (error) {
        if (error) console.error(error);
      }
    );

    await apiCall(
      `index/records/users/${user["user"]["uuid"]}/consent/`,
      "GET",
      (result) => {
        accessRequests = result["data"];
        console.log(result);
      }
    );
  });
</script>

{#await $userStore then user}
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

    <!--ID-->
    <div class="columns is-flex is-centered mb-0">
      <canvas id="qr-code" style="width:256px;height:256px;" />
    </div>
    <p class="has-text-centered is-size-7">
      {user["user"]["uuid"]}
    </p>

    <!--Access Requests-->
    <p class="is-size-4 mt-2">Access Requests</p>
    <div
      class="list has-visible-pointer-controls has-hoverable-list-items has-overflow-ellipsis"
    >
      {#each accessRequests as accessRequest}
        <div class="list-item">
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
                <span class="tag is-info">PENDING</span>
                <span class="tag is-dark">Doc</span>
              </div>
            {:else if accessRequest.status == "APPROVED"}
              <div class="tags are-normal">
                <span class="tag is-success">GRANTED</span>
                <span class="tag is-dark">Doc</span>
              </div>
            {:else}
              <div class="tags are-normal">
                <span class="tag is-warning">WITHDRAWN</span>
                <span class="tag is-dark">Doc</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/await}
