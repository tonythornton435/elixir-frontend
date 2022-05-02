<script lang="ts">
  import { mdiCheckDecagramOutline, mdiWindowClose } from "@mdi/js";
  import Icon from "mdi-svelte";
  import { afterUpdate, onMount } from "svelte";
  import StarRating from "svelte-star-rating";

  import { getValue } from "../common-stores";
  import type {
    ICD10,
    Observation,
    Prescription,
    Service,
    Visit,
  } from "../types";
  import { apiCall, bulma, toDateString } from "../utils";

  export let tab = this;

  let visit: Visit,
    visitRecord,
    patient,
    diagnoses: ICD10[] = [],
    prescriptions: Prescription[] = [],
    labs: Observation[] = [],
    services: Service[] = [],
    billTotal = 0,
    paidTotal = 0,
    events = [];

  onMount(async () => {
    bulma();
    visitRecord = await getValue("visit-record");
    apiCall(`facility/visits/${visitRecord["uuid"]}/`, "GET", (result) => {
      visit = result["data"];
      console.log(visit);

      diagnoses = [visit.primary_diagnosis, ...visit.secondary_diagnoses];
      for (let encounter of visit.encounters) {
        labs = [...labs, ...encounter.observations];
        prescriptions = [...prescriptions, ...encounter.prescriptions];
        services = [...services, ...encounter.services];
      }
      let chargeableItems = [...labs, ...prescriptions, ...services];
      console.log(chargeableItems);
      billTotal = chargeableItems.reduce(
        (acc, x) => acc + x.quantity * (x.unit_price || 0),
        0
      );
      paidTotal = chargeableItems
        .filter((x) => x.is_paid)
        .reduce((acc, x) => acc + x.quantity * (x.unit_price || 0), 0);

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
          name: `${access_request["requestor"]["practitioner"]["user"]["first_name"]} ${access_request["requestor"]["practitioner"]["user"]["last_name"]} from ${access_request["requestor"]["facility"]["name"]} requested access (ID: ${i})`,
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
        events.push({
          name: `${rating["rater"]["first_name"]} ${
            rating["rater"]["last_name"]
          } rated ${(rating["accuracy"] + rating["completeness"]) / 2}⭐, ${
            rating["review"]
          }`,
          timestamp: toDateString(rating["created"], true),
          rawDate: new Date(rating["created"]),
          color: "is-info",
        });
      }
      events.sort((a, b) => a["rawDate"] - b["rawDate"]);
    });
    patient = await getValue("patient");
  });
  afterUpdate(bulma);
</script>

{#if visit && patient}
  <div class="container mt-4">
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
          <td class="has-text-weight-bold">Trust Score</td>
          <td>
            <StarRating
              rating={visitRecord["rating"]}
              config={{ showText: true }}
            /></td
          >
        </tr>
      </tbody>
    </table>

    <!--Diagnoses-->
    <div class="divider">Diagnoses</div>
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
      <header class="timeline-header">
        <span class="tag is-medium is-primary">End</span>
      </header>
    </div>
  </div>
{/if}
