<script lang="ts">
  import { link, push } from "svelte-spa-router";
  import jwt_decode from "jwt-decode";
  import { Storage } from "@capacitor/storage";

  import { user } from "./stores";
  import { apiCall } from "./utils";

  let email: string, password: string;
  let loginFailed: boolean = false;

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

<div class="m-auto">
  {#if loginFailed}
    <p>Login failed</p>
  {/if}

  <img
    src="/assets/undraw_unlock.svg"
    class="px-8 my-4 w-full max-w-lg"
    alt="Unlock: Girl holding key"
  />

  <form on:submit|preventDefault={handleSubmit} class="w-full max-w-lg">
    <div class="flex flex-wrap m-1">
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="email"
        >
          Email Address
        </label>
        <input
          bind:value={email}
          class="input-primary"
          id="email"
          type="email"
          placeholder="jane.doe@example.com"
          required
        />
      </div>
    </div>
    <div class="flex flex-wrap m-1">
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="password"
        >
          Password
        </label>
        <input
          bind:value={password}
          class="input-primary"
          id="password"
          type="password"
          placeholder="****************"
          required
        />
      </div>
    </div>
    <div class="flex flex-wrap mx-4 my-1">
      <a
        href="/reset-password"
        use:link
        class="font-bold text-sm text-blue-500 hover:text-blue-800 w-full mb-3 uppercase"
      >
        Forgot Password?
      </a>
      <button class="btn-primary w-full" type="submit">Sign In</button>
    </div>
    <div class="relative flex py-5 items-center mx-4">
      <div class="flex-grow border-t border-gray-400" />
      <span class="flex-shrink mx-4 text-gray-400">OR</span>
      <div class="flex-grow border-t border-gray-400" />
    </div>
    <div class="flex mx-4 my-1">
      <button class="btn-primary w-full">
        <a href="/signup" use:link>Sign Up</a>
      </button>
    </div>
  </form>
</div>
