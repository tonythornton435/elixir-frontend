import { deleteValue, userStore } from "./common-stores";
import { get } from "svelte/store";

import { API_BASE_URL } from "./constants";

export async function apiCall(
  endpoint: string,
  method: string,
  successCallback,
  body?: object,
  failureCallback?
) {
  let user = await get(userStore);
  let request = { method };
  let headers = { "Content-Type": "application/json" };

  if (user) {
    headers["Authorization"] = `Bearer ${user["token"]}`;
  }
  request["headers"] = new Headers(headers);

  if (body) {
    console.log(body);
    request["body"] = JSON.stringify(body);
  }

  if (!failureCallback) {
    failureCallback = (result) => {
      console.error(result);
    };
  }

  await fetch(API_BASE_URL + endpoint, request).then(async (res) => {
    const result = await res.json();

    if (result["status"] === "success") successCallback(result);
    else failureCallback(result);
  });
}

export function prepForPOST(data: object) {
  let result = {};
  console.log(data);
  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Date)
    ) {
      if (Array.isArray(value)) {
        result[key] = value.map((x) =>
          x.hasOwnProperty("uuid") ? x.uuid : prepForPOST(x)
        );
      } else if (value.hasOwnProperty("uuid")) {
        result[`${key}_id`] = value.uuid;
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

export async function logout() {
  deleteValue(userStore, "user");
  localStorage.clear();
}

export function onInputSearchDataList(
  searchFieldID: string,
  datalistID: string,
  callback
) {
  var val = document.getElementById(searchFieldID).value;
  var opts = document.getElementById(datalistID).childNodes;
  for (var i = 0; i < opts.length; i++) {
    if (opts[i].value === val) {
      let data_value = opts[i].getAttribute("data-value");
      callback(data_value);
      break;
    }
  }
}

export function toDateString(dateObj: Date | string, appendTime = false) {
  const date: Date =
    dateObj instanceof Date ? (dateObj as Date) : new Date(dateObj);

  let result = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (appendTime) {
    result += ` ${(date.getUTCHours() + 3).toString().padStart(2, "0")}:${date
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  }
  return result;
}

export const clickEvent = new MouseEvent("click", {
  view: window,
  bubbles: true,
  cancelable: false,
});

export const delay = (s) => new Promise((res) => setTimeout(res, s * 1000));

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
  (document.querySelectorAll(".tab") || []).forEach(($tab) => {
    $tab.addEventListener("click", (e) => {
      // event.currentTarget refers to element on which
      // the event listener was attached
      const tabName = e.currentTarget.attributes[1].nodeValue;
      const currentTab = document.querySelector(".tab.is-active");
      const currentContent = document.getElementById(
        `${currentTab.id}-content`
      );
      const newTab = document.getElementById(tabName);
      const newTabContent = document.getElementById(`${tabName}-content`);

      currentTab.classList.remove("is-active");
      currentContent.classList.add("is-hidden");

      newTab.classList.add("is-active");
      newTabContent.classList.remove("is-hidden");
    });
  });
}
