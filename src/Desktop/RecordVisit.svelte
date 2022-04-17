<script lang="ts">
  import { link, push } from "svelte-spa-router";
  import Icon from "mdi-svelte";
  import {
    mdiCalendar,
    mdiCash,
    mdiDoctor,
    mdiFaceRecognition,
    mdiFlask,
    mdiHospitalBuilding,
    mdiReceipt,
  } from "@mdi/js";
  import { afterUpdate, onMount } from "svelte";

  import { apiCall, bulma } from "../utils";

  onMount(bulma);
  afterUpdate(bulma);
</script>

<div class="tabs is-centered is-boxed is-medium">
  <ul>
    <li class="is-active">
      <a>
        <span class="icon is-small"><Icon path={mdiFaceRecognition} /></span>
        <span>Patient</span>
      </a>
    </li>
    <li>
      <a>
        <span class="icon is-small"><Icon path={mdiDoctor} /></span>
        <span>Consultation</span>
      </a>
    </li>
    <li>
      <a>
        <span class="icon is-small"><Icon path={mdiFlask} /></span>
        <span>Labs</span>
      </a>
    </li>
    <li>
      <a>
        <span class="icon is-small"><Icon path={mdiCash} /></span>
        <span>Billing</span>
      </a>
    </li>
  </ul>
</div>
