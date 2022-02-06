<script lang="ts">
  import Icon from "mdi-svelte";
  import {
    mdiBaby,
    mdiFlask,
    mdiGlasses,
    mdiHospitalBuilding,
    mdiMagnify,
    mdiPill,
    mdiTooth,
  } from "@mdi/js";

  import { apiCall } from "../utils";
  import NoMatchingResults from "../NoMatchingResults.svelte";

  let query: string,
    searching = false,
    facilities = [],
    practitioners = [];

  apiCall(
    "index/facilities/",
    "GET",
    (result) => {
      console.log(result);
      facilities = result["data"];
    },
    (result) => console.log(result)
  );

  apiCall(
    "index/practitioners/",
    "GET",
    (result) => {
      console.log(result);
      practitioners = result["data"];
    },
    (result) => console.log(result)
  );

  async function handleSearch() {
    searching = true;
    await apiCall(
      "index/providers/search/",
      "POST",
      (result) => {
        console.log(result);
        facilities = result["data"];
      },
      (result) => {
        console.log(result);
      },
      JSON.stringify({ query })
    );
  }
</script>

<div class="w-full px-3 mt-5">
  <!--Provider Search-->
  <form on:submit|preventDefault={handleSearch} class="flex">
    <input
      bind:value={query}
      class="input-primary"
      id="providerSearchQuery"
      type="text"
      placeholder="Search Provider"
      required
    />
    <button class="btn-primary ml-2 mb-2.5 shadow" type="submit">
      <Icon path={mdiMagnify} />
    </button>
  </form>

  <!--Search Results-->
  <div class="w-full">
    {#if facilities.length + practitioners.length > 0 || !searching}
      <ul class="divide-y-2 divide-gray-100">
        {#each facilities as facility}
          <li class="p-3 border border-gray-200 rounded-md mt-1 shadow">
            <div class="flex">
              {#if facility["type"] == "MBL"}
                <Icon path={mdiFlask} />
              {:else if facility["type"] == "PHARM"}
                <Icon path={mdiPill} />
              {:else if facility["type"] == "PEDC"}
                <Icon path={mdiBaby} />
              {:else if facility["type"] == "OPTC"}
                <Icon path={mdiGlasses} />
              {:else if facility["type"] == "DENT"}
                <Icon path={mdiTooth} />
              {:else}
                <!--HOSP, PSY, RH-->
                <Icon path={mdiHospitalBuilding} />
              {/if}
              <p class="font-bold ml-2 mt-0.5">{facility["name"]}</p>
            </div>
            <div class="flex justify-between mt-2">
              <div class="italic">
                <p class="text-sm text-gray-800">
                  {facility["location"]}, {facility["county"]}
                </p>
                <p class="text-sm text-gray-800">{facility["address"]}</p>
              </div>
              <div>
                <p class="text-sm text-gray-800">{facility["phone_number"]}</p>
                <p class="text-sm text-gray-800">{facility["email"]}</p>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <NoMatchingResults />
    {/if}
  </div>
</div>
