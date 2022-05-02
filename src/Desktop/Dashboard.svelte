<script lang="ts">
  import { link } from "svelte-spa-router";

  import { userStore } from "../common-stores";
  import Patient from "./Patient.svelte";
  import RecordVisit from "./RecordVisit.svelte";
  import Visit from "./Visit.svelte";

  let tab = Patient;
</script>

{#await $userStore then user}
  <div class="container is-fullhd">
    <nav
      class="navbar is-fixed-top is-info has-shadow"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand ml-3">
        <a class="navbar-item has-text-weight-bold" href="/" use:link>
          Elixir
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-end mr-2">
          <div class="navbar-item">
            {user["user"]["first_name"]}
            {user["user"]["last_name"]}
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
          <p class="menu-label">Home</p>
          <ul class="menu-list">
            <li><a>Access Requests</a></li>
            <li><a>My History</a></li>
          </ul>
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
          <p class="menu-label">Statistics</p>
          <ul class="menu-list">
            <li><a>Visits</a></li>
            <li><a>Diagnoses</a></li>
            <li><a>Prescriptions</a></li>
            <li><a>Billing</a></li>
          </ul>
        </aside>
      </div>
      <div class="column">
        <svelte:component this={tab} bind:tab />
      </div>
    </div>
  </div>
{/await}
