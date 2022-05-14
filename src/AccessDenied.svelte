<script type="ts">
  import { Capacitor } from "@capacitor/core";
  import { link } from "svelte-spa-router";
</script>

<div class="columns is-flex is-centered">
  <figure class="image">
    <img
      src="/assets/undraw_into_the_night_vumi.svg"
      alt="Into the night."
      style="width:256px;height:auto;"
    />
  </figure>
</div>

<div class="has-text-centered">
  <p class="is-size-2">Access Denied!</p>
  <p class="has-text-centered">
    You do not have the necessary roles to access this protected route.
  </p>
  <button class="button is-warning mt-4 mb-4"
    ><a href="/login" class="has-text-black" use:link>Login</a></button
  >
  {#if !Capacitor.isNativePlatform()}
    <div class="columns is-centered">
      <div class="divider" style="width: 256px;">OR</div>
    </div>
    <button class="button is-warning"
      ><a href="/practitioner-signup" class="has-text-black" use:link
        >Practitioner Sign Up</a
      ></button
    >
  {/if}
</div>
