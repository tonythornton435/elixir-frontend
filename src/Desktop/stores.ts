import { writable } from "svelte/store";

import { getValue } from "../common-stores";

export const patientStore = writable(getValue("patient"));
export const visitStore = writable(getValue("visit"));
export const nurseMeasurementsStore = writable(getValue("nurse-measurements"));
export const consultationStore = writable(getValue("consultation"));
export const labsStore = writable(getValue("labs"));

export const visitRecordStore = writable(getValue("visit-record"));
