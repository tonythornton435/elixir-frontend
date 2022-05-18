<script lang="ts">
  import { Storage } from "@capacitor/storage";
  import { mdiAccountLock, mdiCheckAll, mdiEmail } from "@mdi/js";
  import { toast } from "bulma-toast";
  import Icon from "mdi-svelte";
  import { link, push } from "svelte-spa-router";

  import { userStore } from "./common-stores";
  import { INDEX_API_BASE_URL } from "./constants";
  import { apiCall } from "./utils";

  let email: string, password: string;
</script>

<div class="container is-fluid" style="padding-top: 128px;">
  <form
    on:submit|preventDefault={async () => {
      await apiCall(
        INDEX_API_BASE_URL + "auth/login/",
        "POST",
        async (result) => {
          userStore.set(Promise.resolve(result["data"]));
          await Storage.set({
            key: "user",
            value: JSON.stringify(result["data"]),
          });
          push("/");
        },
        {
          email,
          password,
        },
        () => {
          toast({
            message: "Login failed.",
            type: "is-danger",
            dismissible: true,
            pauseOnHover: true,
            position: "top-center",
            duration: 4000,
          });
        }
      );
    }}
  >
    <div class="columns is-flex is-centered">
      <figure class="image">
        <img
          src="/assets/undraw_unlock.svg"
          alt="Unlock: Girl holding key"
          style="width:256px;height:auto;"
        />
      </figure>
    </div>

    <div class="field">
      <label class="label" for="email">Email Address</label>
      <div class="control has-icons-left">
        <input
          bind:value={email}
          class="input"
          type="email"
          id="email"
          placeholder="jane.doe@example.com"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiEmail} />
        </span>
      </div>
    </div>
    <div class="field">
      <label class="label" for="password">Password</label>
      <div class="control has-icons-left">
        <input
          bind:value={password}
          class="input"
          type="password"
          id="password"
          placeholder="****************"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiAccountLock} />
        </span>
      </div>
    </div>
    <div class="field is-grouped is-grouped-centered mt-4">
      <div class="control">
        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiCheckAll} />
          </span>
          <span>Sign In</span>
        </button>
      </div>
      <div class="control">
        <button class="button is-link is-light">
          <a href="/signup" use:link>Sign Up</a>
        </button>
      </div>
    </div>
  </form>
</div>
