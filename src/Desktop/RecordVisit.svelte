<script lang="ts">
  import {
    mdiBacteria,
    mdiCalculatorVariant,
    mdiCalendarEnd,
    mdiCalendarStart,
    mdiCash,
    mdiChartTimelineVariantShimmer,
    mdiClockCheck,
    mdiContentSave,
    mdiDoctor,
    mdiFlask,
    mdiFlaskEmptyPlus,
    mdiFountainPenTip,
    mdiHexagonSlice1,
    mdiHumanMaleHeight,
    mdiMagnify,
    mdiMedicalBag,
    mdiPlus,
    mdiPrescription,
    mdiReceipt,
    mdiStethoscope,
    mdiTrashCan,
  } from "@mdi/js";
  import { toast } from "bulma-toast";
  import { marked } from "marked";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import structuredClone from "@ungap/structured-clone";

  import { getValue, storeValue } from "../common-stores";
  import Patient from "./Patient.svelte";
  import {
    consultationStore,
    labsStore,
    nurseMeasurementsStore,
    visitStore,
  } from "./stores";
  import {
    ChargeableItem,
    DischargeDisposition,
    encounterDefaults,
    Encounter,
    EncounterClass,
    EncounterStatus,
    LOINC,
    PrescriptionDuration,
    Visit,
    visitDefaults,
    VisitStatus,
    VisitType,
  } from "../types";
  import { apiCall, bulma, clickEvent, prepForPOST } from "../utils";

  export let tab = this;

  let patient,
    practitioner,
    author_id,
    visit: Visit,
    visitStarted = false,
    consultation: Encounter = structuredClone(encounterDefaults),
    labs: Encounter = structuredClone(encounterDefaults),
    nurseMeasurements: Encounter = structuredClone(encounterDefaults),
    chargeableItems: ChargeableItem[] = [];
  let selectedMeasurement: LOINC,
    availableMeasurements: LOINC[] = [];
  let billTotal = 0,
    paidTotal = 0;

  $: {
    chargeableItems = [
      ...consultation.services,
      ...labs.observations,
      ...consultation.prescriptions,
    ];
    billTotal = chargeableItems.reduce(
      (acc, x) => acc + x.quantity * (x.unit_price || 0),
      0
    );
    paidTotal = chargeableItems
      .filter((x) => x.is_paid)
      .reduce((acc, x) => acc + x.quantity * (x.unit_price || 0), 0);
  }

  onMount(async () => {
    bulma();
    patient = await getValue("patient");
    practitioner = await getValue("practitioner");
    author_id = practitioner["extra"]["latest_tenure"]["uuid"];
    if (patient === null) {
      tab = Patient;
    }

    visit = (await getValue("visit")) || visitDefaults;
    if (consultation.author_id === null) {
      consultation.author_id = author_id;
      labs.author_id = author_id;
      nurseMeasurements.author_id = author_id;
    }
    visitStarted = visit.type != null;
    consultation = (await getValue("consultation")) || consultation;
    labs = (await getValue("labs")) || labs;
    nurseMeasurements =
      (await getValue("nurse-measurements")) || nurseMeasurements;
    const observedCodes = nurseMeasurements.observations.map(
      (observation) => observation.loinc.code
    );
    await apiCall(
      "facility/loinc/arrival-measurements/",
      "GET",
      (result) => (availableMeasurements = result["data"])
    );
    availableMeasurements = availableMeasurements.filter(
      (measurement) => !observedCodes.includes(measurement.code)
    );
  });
  afterUpdate(bulma);

  /* Search */
  // ICD10
  let ICD10s = [],
    ICD10SearchQuery: string,
    searchingICD10 = false;
  // LOINC
  let LOINCs = [],
    LOINCSearchQuery: string,
    searchingLOINC = false;
  // RxTerm
  let RxTerms = [],
    RxTermSearchQuery: string,
    searchingRxTerm = false;
  // HCPCS
  let HCPCSs = [],
    HCPCSSearchQuery: string,
    searchingHCPCS = false;

  function resultsToast(n) {
    toast({
      message: `${n} ${n == 1 ? "match" : "matches"} found.`,
      type: n == 0 ? "is-warning" : "is-success",
      dismissible: false,
      pauseOnHover: true,
      position: "top-right",
      duration: 2000,
    });
  }
</script>

{#if patient && visit && consultation && nurseMeasurements && labs}
  <div class="tabs is-boxed is-fullwidth mt-2">
    <ul>
      <li class="tab is-active" id="startVisitTab">
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><Icon path={mdiCalendarStart} /></span>
          <span>Start Visit</span>
        </a>
      </li>
      <li class="tab" id="measurementsTab" class:not-clickable={!visitStarted}>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><Icon path={mdiStethoscope} /></span>
          <span>Measurements</span>
        </a>
      </li>
      <li class="tab" id="consultationTab" class:not-clickable={!visitStarted}>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><Icon path={mdiDoctor} /></span>
          <span>Consultation</span>
        </a>
      </li>
      <li class="tab" id="labsTab" class:not-clickable={!visitStarted}>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><Icon path={mdiFlask} /></span>
          <span>Labs</span>
        </a>
      </li>
      <li class="tab" id="billingTab" class:not-clickable={!visitStarted}>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><Icon path={mdiCash} /></span>
          <span>Billing</span>
        </a>
      </li>
      <li class="tab" id="endVisitTab" class:not-clickable={!visitStarted}>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><Icon path={mdiCalendarEnd} /></span>
          <span>Finalize Visit</span>
        </a>
      </li>
    </ul>
  </div>

  <div class="column is-12 tabs-content">
    <!--Start Visit Tab-->
    <div id="startVisitTab-content">
      <div class="columns has-text-weight-bold">
        <div class="column">
          <p>Confirm Patient Details</p>
        </div>
      </div>
      <div class="columns">
        <div class="column is-quarter has-background-light">
          <p class="py-1">First Name</p>
          <p class="silver-separator py-1">Gender</p>
          <p class="silver-separator py-1">National ID</p>
        </div>
        <div class="column is-quarter">
          <p class="py-1">{patient["first_name"]}</p>
          <p class="silver-separator py-1">{patient["gender"]}</p>
          <p class="silver-separator py-1">{patient["national_id"]}</p>
        </div>
        <div class="column is-quarter has-background-light">
          <p class="py-1">Last Name</p>
          <p class="silver-separator py-1">Date Of Birth</p>
          <p class="silver-separator py-1">Phone Number</p>
        </div>
        <div class="column is-quarter">
          <p class="py-1">{patient["last_name"]}</p>
          <p class="silver-separator py-1">{patient["date_of_birth"]}</p>
          <p class="silver-separator py-1">{patient["phone_number"]}</p>
        </div>
      </div>

      <form
        on:submit|preventDefault={() => {
          visit.patient_id = patient.uuid;
          visit.facility_id = "d4766983-fcd2-436c-8be8-5b1c1ffa3e75"; // TODO
          visit.start = new Date();
          storeValue(visitStore, "visit", visit);
          visitStarted = true;
          nurseMeasurements.start = new Date();
          nurseMeasurements.type = EncounterClass.ObservationEncounter;
          storeValue(
            nurseMeasurementsStore,
            "nurse-measurements",
            nurseMeasurements
          );
          document.getElementById("measurementsTab").dispatchEvent(clickEvent);
        }}
      >
        <div class="field">
          <label class="label" for="visitType">Visit Type</label>
          <div class="control has-icons-left">
            <div class="select">
              <select
                id="visitType"
                bind:value={visit.type}
                disabled={visitStarted}
                required
              >
                <option value={VisitType.Outpatient}>Outpatient</option>
                <option value={VisitType.Inpatient}>Inpatient</option>
                <option value={VisitType.Dental}>Dental</option>
                <option value={VisitType.Optical}>Optical</option>
              </select>
            </div>
            <span class="icon is-small is-left">
              <Icon path={mdiHexagonSlice1} />
            </span>
          </div>
        </div>
        {#if !visitStarted}
          <button class="button is-info" type="submit">
            <span class="icon is-small">
              <Icon path={mdiCalendarStart} />
            </span>
            <span>Start Visit</span>
          </button>
        {:else}
          <button
            class="button is-warning"
            on:click={() => {
              storeValue(visitStore, "visit", null);
              storeValue(nurseMeasurementsStore, "nurse-measurements", null);
              storeValue(consultationStore, "consultation", null);
              storeValue(labsStore, "labs", null);
              tab = Patient;
            }}
          >
            <span class="icon is-small">
              <Icon path={mdiTrashCan} />
            </span>
            <span>Discard Changes</span>
          </button>
        {/if}
      </form>
    </div>

    <div id="measurementsTab-content" class="is-hidden">
      <p class="has-text-weight-bold">Past records</p>
      <br />
      <div class="field">
        <label class="label" for="selectMeasurement">
          Pick measurement to add
          <button
            class="button is-info is-small is-rounded"
            on:click={() => {
              if (selectedMeasurement) {
                nurseMeasurements.observations = [
                  ...nurseMeasurements.observations,
                  {
                    loinc: selectedMeasurement,
                    result: "",
                    unit_price: 0,
                    quantity: 0,
                    is_paid: false,
                  },
                ];
                availableMeasurements = availableMeasurements.filter(
                  (measurement) => measurement != selectedMeasurement
                );
                selectedMeasurement = null;
              }
            }}
            type="button"
          >
            <span class="icon is-small">
              <Icon path={mdiPlus} />
            </span>
            <span>Add</span>
          </button>
        </label>
        <div class="control has-icons-left">
          <div class="select">
            <select
              id="selectMeasurement"
              bind:value={selectedMeasurement}
              required
            >
              {#each availableMeasurements as measurement}
                <option value={measurement}
                  >{measurement.long_common_name}</option
                >
              {/each}
            </select>
          </div>
          <span class="icon is-small is-left">
            <Icon path={mdiHumanMaleHeight} />
          </span>
        </div>
      </div>
      <form
        on:submit|preventDefault={() => {
          storeValue(
            nurseMeasurementsStore,
            "nurse-measurements",
            nurseMeasurements
          );
          consultation.start = new Date();
          consultation.type =
            visit.type == VisitType.Inpatient
              ? EncounterClass.InpatientEncounter
              : EncounterClass.Ambulatory;
          storeValue(consultationStore, "consultation", consultation);
          document.getElementById("consultationTab").dispatchEvent(clickEvent);
        }}
      >
        {#each nurseMeasurements.observations as { loinc, result, unit_price, quantity, is_paid }}
          <div class="field">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label"
              >{loinc.long_common_name} (LOINC Code: {loinc.code}, System: {loinc.system},
              Scale: {loinc.scale})</label
            >
            <div class="control has-icons-left">
              <input
                bind:value={result}
                class="input"
                type="text"
                placeholder={loinc.attribute}
                required
              />
              <span class="icon is-small is-left">
                <Icon path={mdiChartTimelineVariantShimmer} />
              </span>
            </div>
          </div>
        {/each}
        <div class="field">
          <label class="label" for="nurseMeasurementsNotes">Notes</label>
          <div class="box">
            {@html marked(nurseMeasurements.clinical_notes)}
          </div>
          <div class="control">
            <textarea
              bind:value={nurseMeasurements.clinical_notes}
              class="textarea is-info"
              rows="8"
              id="nurseMeasurementsNotes"
              placeholder="Enter clinical notes (in Markdown)"
              required
            />
          </div>
        </div>

        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiContentSave} />
          </span>
          <span>Save</span>
        </button>
      </form>
    </div>
    <div id="consultationTab-content" class="is-hidden is-fluid">
      <form
        on:submit|preventDefault={() => {
          storeValue(visitStore, "visit", visit);
          storeValue(consultationStore, "consultation", consultation);
          labs.start = new Date();
          labs.type = EncounterClass.ObservationEncounter;
          storeValue(labsStore, "labs", labs);
          document.getElementById("labsTab").dispatchEvent(clickEvent);
        }}
        style="width: 100% !important;"
      >
        <!--Clinical Notes-->
        <div class="field">
          <label class="label" for="consultationNotes">Notes</label>
          <div class="box">
            {@html marked(consultation.clinical_notes)}
          </div>
          <div class="control">
            <textarea
              bind:value={consultation.clinical_notes}
              class="textarea is-info"
              rows="8"
              id="consultationNotes"
              placeholder="Enter consultation notes (in Markdown)"
              required
            />
          </div>
        </div>

        <!--Labs-->
        <div class="divider">Labs</div>
        <p class="has-text-weight-bold mt-2 mb-2">
          Labs
          <button
            class="button is-info is-small is-rounded"
            on:click={() => {
              labs.observations = [
                ...labs.observations,
                {
                  loinc: null,
                  result: "",
                  unit_price: null,
                  quantity: 1,
                  is_paid: false,
                },
              ];
            }}
            type="button"
          >
            <span class="icon is-small">
              <Icon path={mdiPlus} />
            </span>
            <span>Add</span>
          </button>
        </p>
        <div class="field has-addons" style="width: 100% !important;">
          <div
            class="control"
            class:is-loading={searchingLOINC}
            style="width: 100% !important;"
          >
            <input
              bind:value={LOINCSearchQuery}
              class="input"
              placeholder="Search LOINC"
            />
          </div>
          <div class="control">
            <button
              class="button is-link"
              type="button"
              on:click={async () => {
                searchingLOINC = true;
                await apiCall(
                  "facility/loinc/search/",
                  "POST",
                  (result) => {
                    LOINCs = result["data"];
                    console.log(LOINCs);
                    resultsToast(LOINCs.length);
                  },
                  { query: LOINCSearchQuery }
                );
                searchingLOINC = false;
              }}
            >
              <Icon path={mdiMagnify} />
            </button>
          </div>
        </div>
        {#each labs.observations as { loinc, result, unit_price, quantity, is_paid }}
          <div class="field">
            <div class="control has-icons-left">
              <div class="select">
                <select bind:value={loinc} required>
                  {#if loinc}
                    <option value={loinc}
                      >{loinc.long_common_name} ({loinc.code})</option
                    >
                  {/if}
                  {#each LOINCs as aLoinc}
                    {#if !(loinc && aLoinc.code == loinc.code)}
                      <option value={aLoinc}
                        >{aLoinc.long_common_name} ({aLoinc.code})</option
                      >
                    {/if}
                  {/each}
                </select>
              </div>
              <span class="icon is-small is-left">
                <Icon path={mdiFlaskEmptyPlus} />
              </span>
            </div>
          </div>
        {/each}

        <!--Diagnoses-->
        <div class="divider">Diagnoses</div>
        <p class="has-text-weight-bold mt-2 mb-2">Diagnoses</p>
        <div class="field has-addons" style="width: 100% !important;">
          <div
            class="control"
            class:is-loading={searchingICD10}
            style="width: 100% !important;"
          >
            <input
              bind:value={ICD10SearchQuery}
              class="input"
              placeholder="Search ICD10 Diagnosis"
            />
          </div>
          <div class="control">
            <button
              class="button is-link"
              type="button"
              on:click={async () => {
                searchingICD10 = true;
                await apiCall(
                  "facility/icd10/search/",
                  "POST",
                  (result) => {
                    ICD10s = result["data"];
                    resultsToast(ICD10s.length);
                  },
                  { query: ICD10SearchQuery }
                );
                searchingICD10 = false;
              }}
            >
              <Icon path={mdiMagnify} />
            </button>
          </div>
        </div>
        <div class="field">
          <label class="label" for="primaryDiagnosis">Primary Diagnosis</label>
          <div class="control has-icons-left">
            <div class="select">
              <select
                id="primaryDiagnosis"
                bind:value={visit.primary_diagnosis}
              >
                {#if visit.primary_diagnosis}
                  <option value={visit.primary_diagnosis}
                    >{visit.primary_diagnosis.description} ({visit
                      .primary_diagnosis.code})</option
                  >
                {/if}
                {#each ICD10s as anICD10}
                  {#if !(visit.primary_diagnosis && anICD10.code == visit.primary_diagnosis.code)}
                    <option value={anICD10}
                      >{anICD10.description} ({anICD10.code})</option
                    >
                  {/if}
                {/each}
              </select>
            </div>
            <span class="icon is-small is-left">
              <Icon path={mdiBacteria} />
            </span>
          </div>
        </div>
        <p class="mb-2">
          <span class="has-text-weight-bold">Secondary Diagnoses</span>
          <button
            class="button is-info is-small is-rounded"
            on:click={() => {
              visit.secondary_diagnoses = [...visit.secondary_diagnoses, null];
            }}
            type="button"
          >
            <span class="icon is-small">
              <Icon path={mdiPlus} />
            </span>
            <span>Add</span>
          </button>
        </p>
        {#each visit.secondary_diagnoses as secondary_diagnosis}
          <div class="field">
            <div class="control has-icons-left">
              <div class="select">
                <select bind:value={secondary_diagnosis} required>
                  {#if secondary_diagnosis}
                    <option value={secondary_diagnosis}
                      >{secondary_diagnosis.description} ({secondary_diagnosis.code})</option
                    >
                  {/if}
                  {#each ICD10s as anICD10}
                    {#if !(secondary_diagnosis && anICD10.code == secondary_diagnosis.code)}
                      <option value={anICD10}
                        >{anICD10.description} ({anICD10.code})</option
                      >
                    {/if}
                  {/each}
                </select>
              </div>
              <span class="icon is-small is-left">
                <Icon path={mdiBacteria} />
              </span>
            </div>
          </div>
        {/each}

        <!--Procedures-->
        <div class="divider">Services & Procedures</div>
        <p class="has-text-weight-bold mt-2 mb-2">
          Services & Procedures
          <button
            class="button is-info is-small is-rounded"
            on:click={() => {
              consultation.services = [
                ...consultation.services,
                {
                  item: null,
                  unit_price: null,
                  quantity: 1,
                  is_paid: false,
                },
              ];
            }}
            type="button"
          >
            <span class="icon is-small">
              <Icon path={mdiPlus} />
            </span>
            <span>Add</span>
          </button>
        </p>
        <div class="field has-addons" style="width: 100% !important;">
          <div
            class="control"
            class:is-loading={searchingHCPCS}
            style="width: 100% !important;"
          >
            <input
              bind:value={HCPCSSearchQuery}
              class="input"
              placeholder="Search Service or Procedure"
            />
          </div>
          <div class="control">
            <button
              class="button is-link"
              type="button"
              on:click={async () => {
                searchingHCPCS = true;
                await apiCall(
                  "facility/hcpcs/search/",
                  "POST",
                  (result) => {
                    HCPCSs = result["data"];
                    console.log(HCPCSs);
                    resultsToast(HCPCSs.length);
                  },
                  { query: HCPCSSearchQuery }
                );
                searchingHCPCS = false;
              }}
            >
              <Icon path={mdiMagnify} />
            </button>
          </div>
        </div>
        {#each consultation.services as { item, quantity, unit_price, is_paid }}
          <div class="field">
            <div class="control has-icons-left">
              <div class="select">
                <select bind:value={item} required>
                  {#if item}
                    <option value={item}
                      >{item.description} ~ {item.status_code} ({item.code})</option
                    >
                  {/if}
                  {#each HCPCSs as aHCPCS}
                    {#if !(item && aHCPCS.code == item.code)}
                      <option value={aHCPCS}
                        >{aHCPCS.description} ~ {aHCPCS.status_code} ({aHCPCS.code})</option
                      >
                    {/if}
                  {/each}
                </select>
              </div>
              <span class="icon is-small is-left">
                <Icon path={mdiMedicalBag} />
              </span>
            </div>
          </div>
        {/each}

        <!--Prescriptions-->
        <div class="divider">Prescriptions</div>
        <p class="has-text-weight-bold mt-2 mb-2">
          Prescriptions
          <button
            class="button is-info is-small is-rounded"
            on:click={() => {
              consultation.prescriptions = [
                ...consultation.prescriptions,
                {
                  drug: null,
                  description: "",
                  frequency: null,
                  duration: null,
                  unit_price: null,
                  quantity: 1,
                  is_paid: false,
                },
              ];
            }}
            type="button"
          >
            <span class="icon is-small">
              <Icon path={mdiPlus} />
            </span>
            <span>Add</span>
          </button>
        </p>
        <div class="field has-addons" style="width: 100% !important;">
          <div
            class="control"
            class:is-loading={searchingRxTerm}
            style="width: 100% !important;"
          >
            <input
              bind:value={RxTermSearchQuery}
              class="input"
              placeholder="Search RxTerm"
            />
          </div>
          <div class="control">
            <button
              class="button is-link"
              type="button"
              on:click={async () => {
                searchingRxTerm = true;
                await apiCall(
                  "facility/rxterm/search/",
                  "POST",
                  (result) => {
                    RxTerms = result["data"];
                    console.log(RxTerms);
                    resultsToast(RxTerms.length);
                  },
                  { query: RxTermSearchQuery }
                );
                searchingRxTerm = false;
              }}
            >
              <Icon path={mdiMagnify} />
            </button>
          </div>
        </div>
        {#each consultation.prescriptions as { drug, description, frequency, duration, unit_price, quantity, is_paid }}
          <div class="field">
            <div class="control has-icons-left">
              <div class="select">
                <select bind:value={drug} required>
                  {#if drug}
                    <option value={drug}
                      >{drug.name} ~ {drug.strength} ({drug.code})</option
                    >
                  {/if}
                  {#each RxTerms as rxterm}
                    {#if !(drug && rxterm.code == drug.code)}
                      <option value={rxterm}
                        >{rxterm.name} ~ {rxterm.strength} ({rxterm.code})</option
                      >
                    {/if}
                  {/each}
                </select>
              </div>
              <span class="icon is-small is-left">
                <Icon path={mdiPrescription} />
              </span>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <p class="control has-icons-left">
                  <input
                    bind:value={frequency}
                    class="input"
                    type="integer"
                    placeholder="Frequency"
                    required
                  />
                  <span class="icon is-small is-left">
                    <Icon path={mdiCalculatorVariant} />
                  </span>
                </p>
              </div>
              <div class="field">
                <div class="control has-icons-left">
                  <div class="select">
                    <select bind:value={duration} required>
                      <option value={PrescriptionDuration.Day}>Day</option>
                      <option value={PrescriptionDuration.Hour}>Hour</option>
                      <option value={PrescriptionDuration.Week}>Week</option>
                      <option value={PrescriptionDuration.Month}>Month</option>
                      <option value={PrescriptionDuration.Year}>Year</option>
                    </select>
                  </div>
                  <span class="icon is-small is-left">
                    <Icon path={mdiClockCheck} />
                  </span>
                </div>
              </div>
              <div class="field">
                <p class="control has-icons-left">
                  <input
                    bind:value={description}
                    class="input"
                    type="integer"
                    placeholder="Description"
                    required
                  />
                  <span class="icon is-small is-left">
                    <Icon path={mdiFountainPenTip} />
                  </span>
                </p>
              </div>
            </div>
          </div>
        {/each}

        <div class="divider">Discharge</div>
        <div class="field">
          <label class="label" for="dischargeDisposition"
            >Discharge Disposition</label
          >
          <div class="control has-icons-left">
            <div class="select">
              <select
                id="dischargeDisposition"
                bind:value={visit.discharge_disposition}
                required
              >
                <option value={DischargeDisposition.Home}>Home</option>
                <option value={DischargeDisposition.HospiceAlternativeHome}
                  >Hospice Alternative Home</option
                >
                <option value={DischargeDisposition.HospiceHealthCareFacility}
                  >Hospice HealthCare Facility</option
                >
                <option value={DischargeDisposition.AcuteCareFacility}
                  >Acute Care Facility</option
                >
                <option value={DischargeDisposition.OtherHealthFacility}
                  >Other Health Facility</option
                >
                <option value={DischargeDisposition.Expired}>Expired</option>
                <option value={DischargeDisposition.LeftAgainstMedicalAdvice}
                  >Left Against Medical Advice</option
                >
                <option value={DischargeDisposition.NotDocumented}
                  >Not Documented</option
                >
              </select>
            </div>
            <span class="icon is-small is-left">
              <Icon path={mdiHexagonSlice1} />
            </span>
          </div>
        </div>

        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiContentSave} />
          </span>
          <span>Save</span>
        </button>
      </form>
    </div>
    <div id="labsTab-content" class="is-hidden">
      <form
        on:submit|preventDefault={() => {
          storeValue(labsStore, "labs", labs);
          document.getElementById("consultationTab").dispatchEvent(clickEvent);
        }}
      >
        {#each labs.observations as { loinc, result, unit_price, quantity, is_paid }}
          {#if loinc}
            <div class="field">
              <!-- svelte-ignore a11y-label-has-associated-control -->
              <label class="label"
                >{loinc.long_common_name} (LOINC Code: {loinc.code}, System: {loinc.system},
                Scale: {loinc.scale})</label
              >
              <div class="control has-icons-left">
                <input
                  bind:value={result}
                  class="input"
                  type="text"
                  placeholder={loinc.attribute}
                  required
                />
                <span class="icon is-small is-left">
                  <Icon path={mdiFlask} />
                </span>
              </div>
            </div>
          {/if}
        {/each}
        <div class="field">
          <label class="label" for="labsNotes">Notes</label>
          <div class="box">
            {@html marked(labs.clinical_notes)}
          </div>
          <div class="control">
            <textarea
              bind:value={labs.clinical_notes}
              class="textarea is-info"
              rows="8"
              id="labsNotes"
              placeholder="Enter labs notes (in Markdown)"
              required
            />
          </div>
        </div>

        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiContentSave} />
          </span>
          <span>Save</span>
        </button>
      </form>
    </div>
    <div id="billingTab-content" class="is-hidden">
      <form
        on:submit|preventDefault={() => {
          storeValue(consultationStore, "consultation", consultation);
          storeValue(labsStore, "labs", labs);
          storeValue(visitStore, "visit", visit);
          document.getElementById("endVisitTab").dispatchEvent(clickEvent);
        }}
      >
        <div class="field">
          <label class="label" for="invoiceNumber">Invoice Number</label>
          <div class="control has-icons-left">
            <input
              bind:value={visit.invoice_number}
              class="input"
              type="text"
              id="invoiceNumber"
              placeholder="OP123/2022"
              required
            />
            <span class="icon is-small is-left">
              <Icon path={mdiReceipt} />
            </span>
          </div>
        </div>
        <table class="table is-striped is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th />
              <th>Item</th>
              <th>Price (KSh)</th>
              <th>Paid?</th>
            </tr>
          </thead>
          <tbody>
            {#each consultation.services as { item, quantity, unit_price, is_paid }, i}
              {#if item}
                <tr>
                  <th>{i + 1}</th>
                  <td>
                    {item.description}
                  </td>
                  <td
                    ><input
                      type="number"
                      min="1"
                      bind:value={unit_price}
                      required
                    /></td
                  >
                  <td><input type="checkbox" bind:checked={is_paid} /></td>
                </tr>
              {/if}
            {/each}
            {#each labs.observations as { loinc, result, unit_price, quantity, is_paid }, i}
              {#if loinc}
                <tr>
                  <th>{consultation.services.length + i + 1}</th>
                  <td>
                    {loinc.long_common_name}
                  </td>
                  <td
                    ><input
                      type="number"
                      min="1"
                      bind:value={unit_price}
                      required
                    /></td
                  >
                  <td><input type="checkbox" bind:checked={is_paid} /></td>
                </tr>
              {/if}
            {/each}
            {#each consultation.prescriptions as { drug, description, frequency, duration, unit_price, quantity, is_paid }, i}
              {#if drug}
                <tr>
                  <th
                    >{labs.observations.length +
                      consultation.services.length +
                      i +
                      1}</th
                  >
                  <td>
                    {drug.name} ~ {drug.strength}
                  </td>
                  <td
                    ><input
                      type="number"
                      min="1"
                      bind:value={unit_price}
                      required
                    /></td
                  >
                  <td><input type="checkbox" bind:checked={is_paid} /></td>
                </tr>
              {/if}
            {/each}
          </tbody>
          <tfoot>
            <tr>
              <th />
              <th>Total</th>
              <th>{billTotal}</th>
              <th>{paidTotal}</th>
            </tr>
          </tfoot>
        </table>

        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiContentSave} />
          </span>
          <span>Save</span>
        </button>
      </form>
    </div>
    <div id="endVisitTab-content" class="is-hidden">
      <form
        on:submit|preventDefault={async () => {
          visit.status = VisitStatus.Finalized;
          visit.end = new Date();
          storeValue(visitStore, "visit", visit);
          nurseMeasurements.status = EncounterStatus.Finished;
          nurseMeasurements.end = new Date();
          storeValue(
            nurseMeasurementsStore,
            "nurse-measurements",
            nurseMeasurements
          );
          consultation.status = EncounterStatus.Finished;
          consultation.end = new Date();
          storeValue(consultationStore, "consultation", consultation);
          labs.status = EncounterStatus.Finished;
          labs.end = new Date();
          storeValue(labsStore, "labs", labs);

          visit["encounters"] = [nurseMeasurements, consultation, labs];

          await apiCall(
            "facility/visits/new/",
            "POST",
            async (result) => {
              let visit = result["data"];
              console.log(visit);
              // storeValue(visitStore, "visit", null);
              // storeValue(nurseMeasurementsStore, "nurse-measurements", null);
              // storeValue(consultationStore, "consultation", null);
              // storeValue(labsStore, "labs", null);
              tab = Patient;
            },
            prepForPOST(visit)
          );
        }}
      >
        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiCalendarEnd} />
          </span>
          <span>Save Visit</span>
        </button>
      </form>
    </div>
  </div>
{/if}
