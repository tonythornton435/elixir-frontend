import { get } from "svelte/store";
import { Storage } from "@capacitor/storage";

import { user } from "./stores";
import { API_BASE_URL } from "./constants";

export async function apiCall(
  endpoint: string,
  method: string,
  successCallback,
  failureCallback,
  body?: string
) {
  let userObj = await get(user);
  let requestObj = { method };
  let headers = { "Content-Type": "application/json" };

  if (userObj) {
    headers["Authorization"] = `Bearer ${userObj["token"]["rawToken"]}`;
  }
  requestObj["headers"] = new Headers(headers);

  if (body) {
    requestObj["body"] = body;
  }

  console.log(requestObj, userObj);

  await fetch(API_BASE_URL + endpoint, requestObj).then(async (res) => {
    const result = await res.json();

    if (result["status"] === "success") successCallback(result);
    else failureCallback(result);
  });
}

export async function logout() {
  await Storage.remove({ key: "user" });
  user.set(null);
}

export function bulma() {
  // NAVBAR
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach((el) => {
      el.addEventListener("click", () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }

  // NOTIFICATION
  (document.querySelectorAll(".notification .delete") || []).forEach(
    ($delete) => {
      const $notification = $delete.parentNode;

      $delete.addEventListener("click", () => {
        $notification.parentNode.removeChild($notification);
      });
    }
  );

  // MODAL
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add("is-active");
  }

  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll(".js-modal-trigger") || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (
    document.querySelectorAll(
      ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button"
    ) || []
  ).forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener("keydown", (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) {
      // Escape key
      closeAllModals();
    }
  });

  // TABS
  (document.querySelectorAll(".tab") || []).forEach($tab => {
    $tab.addEventListener('click', (e) => {
      // event.currentTarget refers to element on which
      // the event listener was attached
      const tabName = e.currentTarget.attributes[1].nodeValue;
      const currentTab = document.querySelector('.tab.is-active');
      const currentContent = document.getElementById(`${currentTab.id}-content`);
      const newTab = document.getElementById(tabName);
      const newTabContent = document.getElementById(`${tabName}-content`);

      console.log(tabName, currentTab, `${currentTab.id}-content`, newTab, `${tabName}-content`);

      currentTab.classList.remove('is-active');
      currentContent.classList.add('is-hidden');

      newTab.classList.add('is-active');
      newTabContent.classList.remove('is-hidden');
    })
  })
}
