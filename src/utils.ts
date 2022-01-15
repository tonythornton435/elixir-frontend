import { get } from "svelte/store";

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

  console.log(requestObj);

  await fetch(API_BASE_URL + endpoint, requestObj).then(async (res) => {
    const result = await res.json();

    if (result["status"] === "success") successCallback(result);
    else failureCallback(result);
  });
}
