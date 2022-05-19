<script lang="ts">
  import { Capacitor } from "@capacitor/core";
  import {
    mdiCheckAll,
    mdiCheckDecagramOutline,
    mdiChevronLeft,
    mdiStar,
    mdiWindowClose,
  } from "@mdi/js";
  import { marked } from "marked";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import StarRating from "svelte-star-rating";

  import { getValue } from "./common-stores";
  import { INDEX_API_BASE_URL } from "./constants";
  import Patient from "./Desktop/Patient.svelte";
  import {
    EncounterClass,
    ICD10,
    Observation,
    Prescription,
    Service,
    Visit,
  } from "./types";
  import { apiCall, bulma, toDateString } from "./utils";
  import VisitHistory from "./Mobile/VisitHistory.svelte";

  export let tab = this;

  let visit: Visit,
    visitRecord,
    patient,
    user,
    diagnoses: ICD10[] = [],
    prescriptions: Prescription[] = [],
    labs: Observation[] = [],
    services: Service[] = [],
    billTotal = 0,
    paidTotal = 0,
    events = [],
    review = "",
    accuracyRating = 0,
    completenessRating = 0,
    accuracyRatingBuffer,
    completenessRatingBuffer,
    observationNotes = [];

  onMount(async () => {
    bulma();
    visitRecord = await getValue("visit-record");
    user = await getValue("user");
    apiCall(
      visitRecord["facility"]["api_base_url"] +
        `facility/visits/${visitRecord["uuid"]}/`,
      "GET",
      (result) => {
        visit = result["data"];
        console.log(visit);

        diagnoses = [visit.primary_diagnosis, ...visit.secondary_diagnoses];
        for (let encounter of visit.encounters) {
          labs = [...labs, ...encounter.observations];
          prescriptions = [...prescriptions, ...encounter.prescriptions];
          services = [...services, ...encounter.services];
        }
        let chargeableItems = [...labs, ...prescriptions, ...services];
        billTotal = chargeableItems.reduce(
          (acc, x) => acc + x.quantity * (x.unit_price || 0),
          0
        );
        paidTotal = chargeableItems
          .filter((x) => x.is_paid)
          .reduce((acc, x) => acc + x.quantity * (x.unit_price || 0), 0);

        observationNotes = visit.encounters
          .filter((x) => x.type == EncounterClass.ObservationEncounter)
          .map((x) => x.clinical_notes);

        events.push({
          name: "Visit Start",
          timestamp: toDateString(visit.start, true),
          rawDate: new Date(visit.start),
          color: "is-info",
        });
        events.push({
          name: "Visit End",
          timestamp: toDateString(visit.end, true),
          rawDate: new Date(visit.end),
          color: "is-info",
        });
        for (let encounter of visit.encounters) {
          events.push({
            name: `${encounter["type"]} Encounter Started`,
            timestamp: toDateString(encounter.start, true),
            rawDate: new Date(encounter.start),
            color: "is-info",
          });
        }
        for (let i = 0; i < visitRecord["consent_requests"].length; i++) {
          let access_request = visitRecord["consent_requests"][i];
          events.push({
            name: `${access_request["requestor"]["practitioner"]["user"]["first_name"]} ${access_request["requestor"]["practitioner"]["user"]["last_name"]} from ${access_request["requestor"]["facility"]["name"]} requested access, "${access_request["request_note"]}" (ID: ${i})`,
            timestamp: toDateString(access_request["created"], true),
            rawDate: new Date(access_request["created"]),
            color: "is-warning",
          });
          for (let log of access_request["transition_logs"]) {
            events.push({
              name: `Access Request ${i}: ${log["to_state"]}`,
              timestamp: toDateString(log["transition_time"], true),
              rawDate: new Date(log["transition_time"]),
              color: log["to_state"] == "APPROVED" ? "is-success" : "is-danger",
            });
          }
        }
        for (let log of visitRecord["access_logs"]) {
          events.push({
            name: `Access by ${log["practitioner"]["practitioner"]["user"]["first_name"]} ${log["practitioner"]["practitioner"]["user"]["last_name"]} from ${log["practitioner"]["facility"]["name"]}`,
            timestamp: toDateString(log["access_time"], true),
            rawDate: new Date(log["access_time"]),
            color: "is-info",
          });
        }
        for (let rating of visitRecord["ratings"]) {
          let overallRating = (rating["accuracy"] + rating["completeness"]) / 2;
          events.push({
            name: `${rating["rater"]["first_name"]} ${rating["rater"]["last_name"]} rated ${overallRating}⭐, "${rating["review"]}"`,
            timestamp: toDateString(rating["created"], true),
            rawDate: new Date(rating["created"]),
            color:
              overallRating >= 4
                ? "is-success"
                : overallRating >= 3
                ? "is-warning"
                : "is-error",
          });
          if (rating["rater"]["uuid"] == user["user"]["uuid"]) {
            accuracyRating = rating["accuracy"];
            completenessRating = rating["completeness"];
            review = rating["review"];
          }
        }
        events.sort((a, b) => a["rawDate"] - b["rawDate"]);
      }
    );
    patient = await getValue("patient");
  });
  afterUpdate(bulma);
</script>

{#if visit && patient}
  <div
    class="container"
    class:mt-4={!Capacitor.isNativePlatform()}
    class:mx-1={Capacitor.isNativePlatform()}
    class:mb-6={Capacitor.isNativePlatform()}
  >
    <p
      class="is-size-4"
      class:mt-2={Capacitor.isNativePlatform()}
      style="line-height: 32px;"
      on:click={() => {
        if (Capacitor.isNativePlatform()) {
          tab = VisitHistory;
        } else {
          tab = Patient;
        }
      }}
    >
      <span class="is-clickable"
        ><Icon path={mdiChevronLeft} size="32px" /> Back</span
      >
    </p>
    <!-- Visit Particulars -->
    <div class="divider">Visit Particulars</div>
    <table class="table is-striped is-hoverable is-fullwidth">
      <tbody>
        <tr>
          <td class="has-text-weight-bold">Name</td>
          <td>{patient["first_name"]} {patient["last_name"]}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Health Facility</td>
          <td>{visitRecord["facility"]["name"]}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Date</td>
          <td>{toDateString(visitRecord["creation_time"])}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Visit Type</td>
          <td>{visit.type}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Invoice Number</td>
          <td>{visit.invoice_number}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Discharge Disposition</td>
          <td>{visit.discharge_disposition}</td>
        </tr>
        <tr>
          <td class="has-text-weight-bold">Accuracy Score</td>
          <td>
            <StarRating
              rating={visitRecord["rating"][0]}
              config={{ showText: true }}
            /></td
          >
        </tr>
        <tr>
          <td class="has-text-weight-bold">Completeness Score</td>
          <td>
            <StarRating
              rating={visitRecord["rating"][1]}
              config={{ showText: true }}
            /></td
          >
        </tr>
      </tbody>
    </table>

    <!--Diagnoses-->
    <div class="divider">Diagnoses</div>
    <div class="box">
      {@html marked(
        visit.encounters.filter(
          (x) => x.type != EncounterClass.ObservationEncounter
        )[0].clinical_notes
      )}
    </div>
    <div
      class="list has-overflow-ellipsis has-hoverable-list-items has-visible-pointer-controls"
    >
      {#each diagnoses as diagnosis}
        <div class="list-item">
          <div class="list-item-content">
            <div class="list-item-title">
              {diagnosis.description}
            </div>
            <div class="list-item-description">
              {diagnosis.category.title}
            </div>
          </div>
          <div class="list-item-controls">
            <div class="tags are-normal">
              <span class="tag is-primary">{diagnosis.code}</span>
              <span class="tag is-info"
                >{diagnosis.code == visit.primary_diagnosis.code
                  ? "Primary"
                  : "Secondary"}</span
              >
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!--Observations-->
    <div class="divider">Observations & Labs</div>
    {#each observationNotes as note}
      <div class="box">
        {@html marked(note)}
      </div>
    {/each}
    <div
      class="list has-overflow-ellipsis has-hoverable-list-items has-visible-pointer-controls"
    >
      {#each labs as lab}
        <div class="list-item">
          <div class="list-item-content">
            <div class="list-item-title">
              {lab.loinc.long_common_name}
            </div>
            <div class="list-item-description">
              System: <span class="is-italic">{lab.loinc.system}</span>,
              Component: <span class="is-italic">{lab.loinc.component}</span>,
              Scale: <span class="is-italic">{lab.loinc.scale}</span>
            </div>
          </div>
          <div class="list-item-controls">
            <div class="tags are-normal">
              <span class="tag is-dark">{lab.result}</span>
              <span class="tag is-primary">{lab.loinc.code}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!--Prescriptions-->
    <div class="divider">Prescriptions</div>
    <div
      class="list has-overflow-ellipsis has-hoverable-list-items has-visible-pointer-controls"
    >
      {#each prescriptions as prescription}
        <div class="list-item">
          <div class="list-item-content">
            <div class="list-item-title">
              {prescription.drug.name} ({prescription.drug.form}, {prescription
                .drug.route}, {prescription.drug.strength})
            </div>
            <div class="list-item-description">
              <span class="is-italic">{prescription.description}</span>
            </div>
          </div>
          <div class="list-item-controls">
            <div class="tags are-normal">
              <span class="tag is-dark"
                >({prescription.quantity} * {prescription.frequency})/{prescription.duration}</span
              >
              <span class="tag is-primary">{prescription.drug.code}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!--Billing-->
    <div class="divider">Invoice Lines</div>
    <table class="table is-striped is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th>Price (KSh)</th>
          <th>Paid?</th>
        </tr>
      </thead>
      <tbody>
        {#each [...prescriptions, ...labs, ...services] as line}
          {#if line.unit_price != 0}
            <tr>
              {#if line.hasOwnProperty("loinc")}
                <td>{line.loinc.long_common_name}</td>
                <td>Labs</td>
              {:else if line.hasOwnProperty("drug")}
                <td>{line.drug.name}</td>
                <td>Prescription</td>
              {:else}
                <td>{line.item.description}</td>
                <td>Misc</td>
              {/if}
              <td>{line.unit_price}</td>
              <td>
                {#if line.is_paid}
                  <p><Icon path={mdiCheckDecagramOutline} /></p>
                {:else}
                  <p><Icon path={mdiWindowClose} /></p>
                {/if}</td
              >
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

    <!--My Rating-->
    <div class="divider">My Rating</div>
    {#if accuracyRating == 0 || completenessRating == 0}
      <form
        on:submit|preventDefault={async () => {
          await apiCall(
            INDEX_API_BASE_URL + "index/records/ratings/new/",
            "POST",
            (result) => {
              console.log(result);
              accuracyRating = accuracyRatingBuffer;
              completenessRating = completenessRatingBuffer;
            },
            {
              record_id: visitRecord["uuid"],
              rater_id: user["user"]["uuid"],
              accuracy: accuracyRatingBuffer,
              completeness: completenessRatingBuffer,
              review,
            }
          );
        }}
      >
        <div class="columns">
          <div class="column is-half">
            <div class="field">
              <label class="label" for="accuracyRatingBuffer">Accuracy</label>
              <div class="control has-icons-left">
                <div class="select">
                  <select
                    id="accuracyRatingBuffer"
                    bind:value={accuracyRatingBuffer}
                    required
                  >
                    <option value={5}>5</option>
                    <option value={4}>4</option>
                    <option value={3}>3</option>
                    <option value={2}>2</option>
                    <option value={1}>1</option>
                  </select>
                </div>
                <span class="icon is-small is-left">
                  <Icon path={mdiStar} />
                </span>
              </div>
            </div>
          </div>

          <div class="column is-half">
            <div class="field">
              <label class="label" for="completenessRatingBuffer"
                >Completeness</label
              >
              <div class="control has-icons-left">
                <div class="select">
                  <select
                    id="completenessRatingBuffer"
                    bind:value={completenessRatingBuffer}
                    required
                  >
                    <option value={5}>5</option>
                    <option value={4}>4</option>
                    <option value={3}>3</option>
                    <option value={2}>2</option>
                    <option value={1}>1</option>
                  </select>
                </div>
                <span class="icon is-small is-left">
                  <Icon path={mdiStar} />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label" for="recordReview">Review</label>
          <div class="control">
            <textarea
              bind:value={review}
              class="textarea is-info"
              rows="4"
              id="recordReview"
              placeholder="Enter record review"
              required
            />
          </div>
        </div>
        <button class="button is-info" type="submit">
          <span class="icon is-small">
            <Icon path={mdiCheckAll} />
          </span>
          <span>Save Rating</span>
        </button>
      </form>
    {:else}
      <div class="columns has-text-weight-bold mx-1">
        <div class="column is-half">
          Accuracy
          <StarRating rating={accuracyRating} config={{ showText: true }} />
        </div>
        <div class="column is-half">
          Completeness
          <StarRating rating={completenessRating} config={{ showText: true }} />
        </div>
      </div>
      <div class="box mx-2">
        {review}
      </div>
    {/if}

    <!--Timeline-->
    <div class="divider">Timeline</div>
    <div class="timeline is-centered">
      <header class="timeline-header">
        <span class="tag is-medium is-primary">Start</span>
      </header>
      {#each events as event}
        <div class="timeline-item {event['color']}">
          <div class="timeline-marker {event['color']}" />
          <div class="timeline-content">
            <p class="heading">
              {event["timestamp"]}
            </p>
            <p>{event["name"]}</p>
          </div>
        </div>
      {/each}
      <header class="timeline-header" class:mb-2={Capacitor.isNativePlatform()}>
        <span class="tag is-medium is-primary">End</span>
      </header>
    </div>
  </div>
{/if}
