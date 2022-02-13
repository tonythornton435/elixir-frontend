<script lang="ts">
  import { link, push } from "svelte-spa-router";
  import jwt_decode from "jwt-decode";
  import { Storage } from "@capacitor/storage";
  import Icon from "mdi-svelte";
  import { mdiEmail, mdiAccountLock, mdiCheckAll } from "@mdi/js";

  import { user } from "./stores";
  import { apiCall } from "./utils";

  let email: string, password: string;
  let loginFailed = false;

  async function handleSubmit() {
    await apiCall(
      "auth/login/",
      "POST",
      async (result) => {
        loginFailed = false;
        let token = jwt_decode(result["data"]["token"]);
        token["rawToken"] = result["data"]["token"];
        let auth_user = { user: result["data"]["user"], token };
        user.set(Promise.resolve(auth_user));
        await Storage.set({
          key: "user",
          value: JSON.stringify(auth_user),
        });
        push("/");
      },
      () => (loginFailed = true),
      JSON.stringify({
        email,
        password,
      })
    );
  }
</script>

<div class="container is-fluid" style="padding-top: 128px;">
  <form on:submit|preventDefault={handleSubmit}>
    <div class="columns is-flex is-centered">
      <figure class="image">
        <img
          src="/assets/undraw_unlock.svg"
          alt="Unlock: Girl holding key"
          style="width:256px;height:auto;"
        />
      </figure>
    </div>

    {#if loginFailed}
      <div class="notification is-danger">Login failed.</div>
    {/if}

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
