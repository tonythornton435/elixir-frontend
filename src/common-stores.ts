import { Storage } from "@capacitor/storage";
import { writable } from "svelte/store";

export async function getValue(key: string) {
  const { value } = await Storage.get({ key });
  return JSON.parse(value);
}

export async function storeValue(store, key: string, value) {
  store.set(value);
  await Storage.set({
    key,
    value: JSON.stringify(value),
  });
}

export async function deleteValue(store, key: string) {
  await Storage.remove({ key });
  store.set(null);
}

export const userStore = writable(getValue("user"));
