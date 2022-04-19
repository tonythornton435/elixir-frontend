<script lang="ts">
  import { mdiExitRun } from "@mdi/js";
  import Icon from "mdi-svelte";
  import QRCode from "qrcode";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  import { userStore } from "../common-stores";
  import Loading from "../Loading.svelte";
  import { logout } from "../utils";

  onMount(async () => {
    let user = await get(userStore);
    QRCode.toCanvas(
      document.getElementById("qr-code"),
      user["user"]["uuid"],
      function (error) {
        if (error) console.error(error);
      }
    );
  });
</script>

{#await $userStore}
  <Loading />
{:then user}
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

    <!--Consent Requests-->

    <!--Current Visits-->

    <!--Next of Kin(s)-->

    <!--Link to update profile-->
  </div>
{/await}
