<script lang="ts">
  import { apiCall } from "../utils";

  apiCall(
    "index/facilities/",
    "GET",
    (result) => console.log(result),
    (result) => console.log(result)
  );

  apiCall(
    "index/practitioners/",
    "GET",
    (result) => console.log(result),
    (result) => console.log(result)
  );
</script>

Providers

<!--Provider Search-->
<div class="w-full px-3 mt-5">
  <input
    class="input-primary"
    id="providerSearchQuery"
    type="text"
    placeholder="Search Provider"
    required
  />
</div>

<!--Search Results-->
