<script type="ts">
  import { link } from "svelte-spa-router";
</script>

<p>Access Denied!</p>
<p>You do not have the necessary roles to access this protected route.</p>
<p>Please <a href="/login" use:link>login</a>.</p>
