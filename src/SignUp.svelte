<script lang="ts">
  import { link } from "svelte-spa-router";

  let email: string,
    password: string,
    passwordConfirmation: string,
    firstName: string,
    surname: string,
    nationalID: string,
    gender: string,
    dateOfBirth: string,
    phoneNumber: string;

  async function handleSubmit() {}
</script>

<div class="m-auto">
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
          class="input-primary"
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
          class="input-primary"
          id="passwordConfirmation"
          type="password"
          placeholder="****************"
          required
        />
      </div>
    </div>
    <div>
      <div class="datepicker relative form-floating mb-3 xl:w-96">
        <input
          type="text"
          class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          placeholder="Select a date"
        />
        <label for="floatingInput" class="text-gray-700">Select a date</label>
      </div>
    </div>
  </form>

  <a href="/login" use:link class="btn-primary">Login</a>
</div>
