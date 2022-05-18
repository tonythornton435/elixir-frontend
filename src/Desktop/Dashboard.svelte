<script lang="ts">
  import { onMount } from "svelte";
  import { link, replace } from "svelte-spa-router";

  import { getValue, storeValue, userStore } from "../common-stores";
  import { INDEX_API_BASE_URL } from "../constants";
  import Patient from "./Patient.svelte";
  import RecordVisit from "./RecordVisit.svelte";
  import { practitionerStore } from "./stores";
  import Visit from "../Visit.svelte";
  import { apiCall, logout } from "../utils";

  let tab = Patient;

  let user,
    practitioner = null;
  onMount(async () => {
    user = await getValue("user");
    practitioner = await getValue("practitioner");
    if (practitioner == null) {
      apiCall(
        INDEX_API_BASE_URL + `index/practitioners/${user["user"]["uuid"]}/`,
        "GET",
        (result) => {
          practitioner = result["data"];
          storeValue(practitionerStore, "practitioner", practitioner);
        }
      );
    }
  });
</script>

{#await $userStore then user}
  <div class="container is-fullhd">
    <!-- svelte-ignore a11y-no-redundant-roles -->
    <nav
      class="navbar is-fixed-top is-info has-shadow"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand ml-3">
        <a class="navbar-item has-text-weight-bold" href="/" use:link>
          Elixir
          {#if practitioner}
            @ {practitioner["latest_tenure"]["facility"]["name"]}
          {/if}
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end mr-2">
          <div class="navbar-item">
            {user["user"]["first_name"]}
            {user["user"]["last_name"]}
            {#if practitioner}
              - {practitioner["type"]}
            {/if}
          </div>
          <div class="navbar-item">
            <figure class="image">
              <img
                src="/assets/undraw_profile_pic_ic-5-t.svg"
                alt="Signup welcome"
                style="width:auto;height:auto;"
              />
            </figure>
          </div>
        </div>
      </div>
    </nav>

    <div class="columns">
      <div class="column is-one-fifth">
        <aside class="menu">
          <p class="menu-label">Patients</p>
          <ul class="menu-list">
            <!-- svelte-ignore a11y-missing-attribute -->
            <li>
              <a
                class:is-active={tab == Patient}
                on:click={() => (tab = Patient)}>Search</a
              >
            </li>
            <li>
              <!-- svelte-ignore a11y-missing-attribute -->
              <a on:click={() => (tab = Patient)}>Visits</a>
              <ul>
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class:is-active={tab == Visit} on:click={() => (tab = Visit)}
                  >View Visit</a
                >
                <!-- svelte-ignore a11y-missing-attribute -->
                <li>
                  <a
                    class:is-active={tab == RecordVisit}
                    on:click={() => (tab = RecordVisit)}>New Visit</a
                  >
                </li>
              </ul>
            </li>
          </ul>
          <p
            class="menu-label is-clickable"
            on:click={() => {
              logout();
              replace("/login");
            }}
          >
            Logout
          </p>
        </aside>
      </div>
      <div class="column">
        {#if practitioner}
          <svelte:component this={tab} bind:tab />
        {/if}
      </div>
    </div>
  </div>
{/await}
