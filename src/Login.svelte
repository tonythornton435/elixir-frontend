<script lang="ts">
  import { link, push } from "svelte-spa-router";
  import jwt_decode from "jwt-decode";

  import { user } from "./stores";
  import { API_BASE_URL } from "./constants";

  let email: string, password: string;
  let loginFailed: boolean = false;

  async function handleSubmit() {
    await fetch(API_BASE_URL + "auth/login/", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }).then(async (res) => {
      const result = await res.json();

      if (result["status"] === "success") {
        loginFailed = false;
        let token_claims = jwt_decode(result["data"]["token"]);
        user.set({ user: result["data"]["user"], token: token_claims });
        push("/");
      } else {
        loginFailed = true;
      }
    });
  }
</script>

<div>
  {#if loginFailed}
    <p>Login failed</p>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <label>
      Email:
      <input type="email" bind:value={email} />
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} />
    </label>

    <button
      type="submit"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >Submit</button
    >
  </form>

  <a href="/signup" use:link>Signup</a>
</div>
