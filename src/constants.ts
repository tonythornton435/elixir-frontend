import type { LOINC } from "./types";

// export const API_BASE_URL = "http://134.122.87.44:8000/api/";
export const API_BASE_URL = "http://127.0.0.1:8000/api/";

export const onArrivalMeasurements: LOINC[] = [
  {
    uuid: "",
    code: "3141-9",
    component: "Body weight",
    attribute: "Mass",
    timing: "Pt",
    system: "^Patient",
    scale: "Qn",
    method: "Measured",
    long_common_name: "Body weight Measured",
  },
  {
    uuid: "",
    code: "3137-7",
    component: "Body height",
    attribute: "Len",
    timing: "Pt",
    system: "^Patient",
    scale: "Qn",
    method: "Measured",
    long_common_name: "Body height Measured",
  },
  {
    uuid: "",
    code: "8310-5",
    component: "Body temperature",
    attribute: "Temp",
    timing: "Pt",
    system: "^Patient",
    scale: "Qn",
    method: "Measured",
    long_common_name: "Body temperature",
  },
];
