<script lang="ts">
  import { link, push } from "svelte-spa-router";

  import { apiCall } from "./utils";

  let email: string,
    password: string,
    passwordConfirmation: string,
    firstName: string,
    surname: string,
    nationalID: string,
    gender: string,
    dateOfBirth: string,
    phoneNumber: string;
  let passwordsMatch: boolean = true;

  window.addEventListener("load", () => {
    document.getElementById("dateOfBirth").max = new Date()
      .toISOString()
      .split("T")[0];
  });

  async function handleSubmit() {
    passwordsMatch = password === passwordConfirmation;
    if (!passwordsMatch) return;

    await apiCall(
      "auth/register/",
      "POST",
      async (result) => {
        console.log(result);
        push("/login");
      },
      (result) => {
        console.log(result);
      },
      JSON.stringify({
        email,
        password,
        first_name: firstName,
        surname,
        national_id: nationalID,
        gender: gender,
        date_of_birth: dateOfBirth,
        phone_number: phoneNumber,
      })
    );
  }
</script>

<div class="m-auto">
  <img
    src="/assets/undraw_welcome_re_h3d9.svg"
    class="px-8 my-4 w-full max-w-lg"
    alt="Signup welcome"
  />

  <form on:submit|preventDefault={handleSubmit} class="w-full max-w-lg">
    <div class="flex flex-wrap">
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="firstName"
        >
          First Name
        </label>
        <input
          bind:value={firstName}
          class="input-primary"
          id="firstName"
          type="text"
          placeholder="Jane"
          required
        />
      </div>
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="surname"
        >
          Surname
        </label>
        <input
          bind:value={surname}
          class="input-primary"
          id="surname"
          type="text"
          placeholder="Doe"
          required
        />
      </div>
    </div>
    <div class="flex flex-wrap mb-3">
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="nationalID"
        >
          National ID number
        </label>
        <input
          bind:value={nationalID}
          class="input-primary"
          id="nationalID"
          type="text"
          placeholder="12345678"
          required
        />
      </div>
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="gender"
        >
          Gender
        </label>
        <div class="relative">
          <select
            bind:value={gender}
            class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="gender"
          >
            <option selected disabled hidden>Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          >
            <svg
              class="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              ><path
                d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
              /></svg
            >
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap">
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
    <div class="w-full px-3">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for="phoneNumber"
      >
        Phone Number
      </label>
      <input
        bind:value={phoneNumber}
        class="input-primary"
        type="tel"
        id="phoneNumber"
        placeholder="+254712345678"
        required
      />
    </div>
    <div class="flex flex-wrap">
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="password"
        >
          Password
        </label>
        <input
          bind:value={password}
          class="input"
          class:border-red-500={!passwordsMatch}
          class:focus:border-red-500={!passwordsMatch}
          id="password"
          type="password"
          placeholder="****************"
          required
        />
      </div>
    </div>
    <div class="flex flex-wrap">
      <div class="w-full px-3">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          for="passwordConfirmation"
        >
          Confirm Password
        </label>
        <input
          bind:value={passwordConfirmation}
          class="input"
          class:border-red-500={!passwordsMatch}
          class:focus:border-red-500={!passwordsMatch}
          id="passwordConfirmation"
          type="password"
          placeholder="****************"
          required
        />
        {#if !passwordsMatch}
          <p class="text-red-600 ml-2 mb-4 text-xs">Passwords do not match.</p>
        {/if}
      </div>
    </div>
    <div class="w-full px-3">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
        for="passwordConfirmation"
      >
        Date of Birth
      </label>
      <input
        bind:value={dateOfBirth}
        class="input-primary"
        type="date"
        id="dateOfBirth"
        placeholder="Select a date"
        required
      />
    </div>
    <div class="flex flex-wrap mx-4 my-1">
      <button class="btn-primary w-full" type="submit">Sign Up</button>
    </div>
    <div class="relative flex py-5 items-center mx-4">
      <div class="flex-grow border-t border-gray-400" />
      <span class="flex-shrink mx-4 text-gray-400">OR</span>
      <div class="flex-grow border-t border-gray-400" />
    </div>
    <div class="flex mx-4 my-1">
      <button class="btn-primary w-full">
        <a href="/login" use:link>Sign In</a>
      </button>
    </div>
  </form>
</div>
