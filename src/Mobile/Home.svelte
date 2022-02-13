<script lang="ts">
  import { user } from "../stores";
  import QRCode from "qrcode";
  import Icon from "mdi-svelte";
  import { mdiExitRun } from "@mdi/js";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  import { logout } from "../utils";

  import Loading from "../Loading.svelte";

  onMount(async () => {
    let userObj = await get(user);
    QRCode.toCanvas(
      document.getElementById("qr-code"),
      userObj["user"]["uuid"],
      function (error) {
        if (error) console.error(error);
      }
    );
  });
</script>

{#await $user}
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
      {user["user"]["surname"]}
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
