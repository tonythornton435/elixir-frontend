<script lang="ts">
  import { user } from "../stores";

  import Loading from "../Loading.svelte";
</script>

{#await $user}
  <Loading />
{:then user}
  <div class="w-full px-3 mt-5 flex justify-center">
    <div>
      <div class="flex justify-center">
        <div
          class="flex rounded-full border border-gray-400 w-24 h-24 items-center justify-center text-3xl font-bold"
        >
          {user["user"]["first_name"][0]}{user["user"]["surname"][0]}
        </div>
      </div>

      <p class="flex font-bold mt-3 items-center justify-center">
        {user["user"]["first_name"]}
        {user["user"]["surname"]}
      </p>
    </div>
  </div>
{/await}

<!--Consent Requests-->

<!--Current Visits-->

<!--Next of Kin(s)-->

<!--Link to update profile-->
