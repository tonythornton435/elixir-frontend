import { writable } from "svelte/store";
import { Storage } from "@capacitor/storage";

async function getValue(key: string) {
  const { value } = await Storage.get({ key });
  return JSON.parse(value);
}

export const user = writable(getValue("user"));
