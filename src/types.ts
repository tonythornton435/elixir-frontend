export interface Token {
  sub: string;
  exp: string;
  iat: string;
  roles: string;
}

export enum VisitStatus {
  Draft = "DRAFT",
  Finalized = "FINALIZED",
}

interface ID {
  uuid?: string;
}

export interface ICD10Category extends ID {
  code: string;
  title: string;
}
export interface ICD10 extends ID {
  code: string;
  description: string;
  category: ICD10Category;
}

export enum VisitType {
  Outpatient = "OUTPATIENT",
  Inpatient = "INPATIENT",
  Dental = "DENTAL",
  Optical = "OPTICAL",
}
export enum DischargeDisposition {
  Home = "HOME",
  HospiceAlternativeHome = "HOSPICE_ALTERNATIVE_HOME",
  HospiceHealthCareFacility = "HOSPICE_HEALTHCARE_FACILITY",
  AcuteCareFacility = "ACUTE_CARE_FACILITY",
  OtherHealthFacility = "OTHER_HEALTH_FACILITY",
  Expired = "EXPIRED",
  LeftAgainstMedicalAdvice = "LEFT_AGAINST_MEDICAL_ADVICE",
  NotDocumented = "NOT_DOCUMENTED",
}
export interface Visit extends ID {
  patient_id: string;
  facility_id: string;
  type: VisitType;
  start: Date;
  end: Date;
  primary_diagnosis: ICD10;
  secondary_diagnoses: ICD10[];
  invoice_number: string;
  status: VisitStatus;
  discharge_disposition: DischargeDisposition;
}
export const visitDefaults: Visit = {
  patient_id: "",
  facility_id: "",
  type: null,
  start: null,
  end: null,
  primary_diagnosis: null,
  secondary_diagnoses: [],
  invoice_number: "",
  status: VisitStatus.Draft,
  discharge_disposition: DischargeDisposition.NotDocumented,
};

export interface ChargeableItem extends ID {
  unit_price: number;
  quantity: number;
  is_paid: boolean;
}

interface HCPCS extends ID {
  code: string;
  description: string;
  status_code: string;
}

interface Service extends ChargeableItem {
  item: HCPCS;
}

interface RxTerm extends ID {
  code: string;
  name: string;
  route: string;
  strength: string;
  form: string;
}
export enum PrescriptionDuration {
  Hour = "HOUR",
  Day = "DAY",
  Week = "WEEK",
  Month = "MONTH",
  Year = "YEAR",
}
interface Prescription extends ChargeableItem {
  drug: RxTerm;
  description: string;
  frequency: number;
  duration: PrescriptionDuration;
}

export enum EncounterStatus {
  Planned = "PLANNED",
  Arrived = "ARRIVED",
  Triaged = "TRIAGED",
  InProgress = "IN_PROGRESS",
  OnLeave = "ON_LEAVE",
  Finished = "FINISHED",
  Cancelled = "CANCELLED",
  EnteredInError = "ENTERED_IN_ERROR",
}
export enum EncounterClass {
  Ambulatory = "AMB",
  Emergency = "EMER",
  Field = "FLD",
  HomeHealth = "HH",
  InpatientEncounter = "IMP",
  InpatientAcute = "ACUTE",
  InpatientNonAcute = "NONAC",
  ObservationEncounter = "OBSENC",
  PreAdmission = "PRENC",
  ShortStay = "SS",
  Virtual = "VR",
}
export interface LOINC extends ID {
  code: string;
  component: string;
  attribute: string;
  timing: string;
  system: string;
  scale: string;
  method: string;
  long_common_name: string;
  status: string;
}
interface Observation extends ChargeableItem {
  loinc: LOINC;
  result: string;
}
export interface Encounter extends ID {
  status: EncounterStatus;
  type: EncounterClass;
  author_id: string;
  start: Date;
  end: Date;
  clinical_notes: string;
  services: Service[];
  observations: Observation[];
  prescriptions: Prescription[];
  visit_id?: string;
}

export const encounterDefaults: Encounter = {
  status: EncounterStatus.InProgress,
  type: null,
  author_id: null,
  start: null,
  end: null,
  clinical_notes: "",
  services: [],
  observations: [],
  prescriptions: [],
};
