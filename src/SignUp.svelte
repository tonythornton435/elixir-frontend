<script lang="ts">
  import {
    mdiAccountLock,
    mdiAlertCircle,
    mdiBaby,
    mdiCheckAll,
    mdiEmail,
    mdiFaceMan,
    mdiFaceWoman,
    mdiHumanMaleFemaleChild,
    mdiIdCard,
    mdiPhone,
  } from "@mdi/js";
  import { toast } from "bulma-toast";
  import Icon from "mdi-svelte";
  import { link, push } from "svelte-spa-router";

  import { INDEX_API_BASE_URL } from "./constants";
  import { apiCall } from "./utils";

  let email: string,
    password: string,
    passwordConfirmation: string,
    firstName: string,
    lastName: string,
    nationalID: string,
    gender: string,
    dateOfBirth: string,
    phoneNumber: string;
  let passwordsMatch = true;

  window.addEventListener("load", () => {
    (document.getElementById("dateOfBirth") as HTMLInputElement).max =
      new Date().toISOString().split("T")[0];
  });
</script>

<div class="container is-fluid mt-6 mb-4">
  <form
    on:submit|preventDefault={async () => {
      passwordsMatch = password === passwordConfirmation;
      if (!passwordsMatch) return;

      await apiCall(
        INDEX_API_BASE_URL + "auth/register/",
        "POST",
        (result) => {
          push("/login");
        },
        {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          national_id: nationalID,
          gender: gender,
          date_of_birth: dateOfBirth,
          phone_number: phoneNumber,
        },
        () => {
          toast({
            message:
              "Failed. The email is <strong>probably</strong> taken, lol.",
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
          src="/assets/undraw_welcome_re_h3d9.svg"
          alt="Signup welcome"
          style="width:256px;height:auto;"
        />
      </figure>
    </div>

    <div class="field">
      <label class="label" for="firstName">First Name</label>
      <div class="control has-icons-left">
        <input
          bind:value={firstName}
          class="input"
          type="text"
          id="firstName"
          placeholder="Jane"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiFaceMan} />
        </span>
      </div>
    </div>
    <div class="field">
      <label class="label" for="lastName">Last Name</label>
      <div class="control has-icons-left">
        <input
          bind:value={lastName}
          class="input"
          type="text"
          id="lastName"
          placeholder="Doe"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiHumanMaleFemaleChild} />
        </span>
      </div>
    </div>
    <div class="field">
      <label class="label" for="nationalID">National ID</label>
      <div class="control has-icons-left">
        <input
          bind:value={nationalID}
          class="input"
          type="text"
          id="nationalID"
          placeholder="12345678"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiIdCard} />
        </span>
      </div>
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
      <label class="label" for="gender">Gender</label>
      <div class="control has-icons-left">
        <div class="select">
          <select bind:value={gender} id="gender" required>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <span class="icon is-small is-left">
          <Icon path={mdiFaceWoman} />
        </span>
      </div>
    </div>
    <div class="field">
      <label class="label" for="phoneNumber">Phone Number</label>
      <div class="control has-icons-left">
        <input
          bind:value={phoneNumber}
          class="input"
          type="tel"
          id="phoneNumber"
          placeholder="+254712345678"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiPhone} />
        </span>
      </div>
    </div>
    <div class="field">
      <label class="label" for="password">Password</label>
      <div class="control has-icons-left has-icons-right">
        <input
          bind:value={password}
          class="input"
          class:is-danger={!passwordsMatch}
          type="password"
          id="password"
          placeholder="****************"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiAccountLock} />
        </span>
        {#if !passwordsMatch}
          <span class="icon is-small is-right">
            <Icon path={mdiAlertCircle} />
          </span>
        {/if}
      </div>
      {#if !passwordsMatch}
        <p class="help is-danger">The passwords do not match.</p>
      {/if}
    </div>
    <div class="field">
      <label class="label" for="passwordConfirmation">Confirm Password</label>
      <div class="control has-icons-left has-icons-right">
        <input
          bind:value={passwordConfirmation}
          class="input"
          class:is-danger={!passwordsMatch}
          type="password"
          id="passwordConfirmation"
          placeholder="****************"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiAccountLock} />
        </span>
        {#if !passwordsMatch}
          <span class="icon is-small is-right">
            <Icon path={mdiAlertCircle} />
          </span>
        {/if}
      </div>
      {#if !passwordsMatch}
        <p class="help is-danger">The passwords do not match.</p>
      {/if}
    </div>
    <div class="field">
      <label class="label" for="dateOfBirth">Date of Birth</label>
      <div class="control has-icons-left">
        <input
          bind:value={dateOfBirth}
          class="input"
          type="date"
          id="dateOfBirth"
          placeholder="Select a date"
          required
        />
        <span class="icon is-small is-left">
          <Icon path={mdiBaby} />
        </span>
      </div>
    </div>
    <div class="field is-grouped is-grouped-centered mt-4">
      <div class="control">
        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiCheckAll} />
          </span>
          <span>Sign Up</span>
        </button>
      </div>
      <div class="control">
        <button class="button is-link is-light">
          <a href="/practitioner-signup" use:link>Sign In</a>
        </button>
      </div>
    </div>
  </form>
</div>
