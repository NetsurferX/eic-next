// Formalism heraldic EiC — logică pură, fără UI, fără dependențe.
// Nu e integrat în joc. Valorile marcate [PLACEHOLDER] se decid separat.

/* ───────── Tincturi ───────── */

export type Metal = "aur" | "argint";
export type Colour = "rosu" | "azur" | "verde" | "negru" | "purpuriu";
export type Tincture = Metal | Colour;

export const TINCTURES: Record<
  Tincture,
  { label: string; kind: "metal" | "culoare"; hex: string }
> = {
  aur: { label: "Aur", kind: "metal", hex: "#f2c230" },
  argint: { label: "Argint", kind: "metal", hex: "#e8e8ee" },
  rosu: { label: "Roșu", kind: "culoare", hex: "#d62839" },
  azur: { label: "Azur", kind: "culoare", hex: "#1f5fbf" },
  verde: { label: "Verde", kind: "culoare", hex: "#2e8b57" },
  negru: { label: "Negru", kind: "culoare", hex: "#1b1b1f" },
  purpuriu: { label: "Purpuriu", kind: "culoare", hex: "#7a3fa0" },
};

/* ───────── Câmp (partiții) ───────── */

export const PARTITIONS = {
  plin: { count: 1 },
  vertical: { count: 2 }, // tăiat vertical
  orizontal: { count: 2 }, // tăiat orizontal
  diagonal: { count: 2 }, // tăiat diagonal
  patratit: { count: 2 }, // pătrățit, tincturi alternate
} as const;

export type Partition = keyof typeof PARTITIONS;

export interface Field {
  partition: Partition;
  tinctures: Tincture[];
}

/* ───────── Figură, ordinare, exterior ───────── */

export type Attitude = "stând" | "sărind" | "șezând";

export interface Charge {
  kind: "vulpe";
  attitude: Attitude;
  tincture: Tincture;
}

export const ORDINARIES = {
  bordura: { label: "bordură" },
  crucea: { label: "cruce" },
  capul: { label: "cap" },
} as const;

export type OrdinaryKind = keyof typeof ORDINARIES;

export interface Ordinary {
  kind: OrdinaryKind;
  tincture: Tincture;
}

// [PLACEHOLDER] liste provizorii
export type CrestKind = "stea" | "coroană" | "carte";
export type SupportersKind = "lauri" | "stindarde";

export interface Arms {
  field: Field;
  charge: Charge;
  ordinaries?: Ordinary[];
  crest?: CrestKind;
  supporters?: SupportersKind;
  motto?: string;
}

/* ───────── Sloturi (baza pentru progres) ───────── */

export const SLOTS = ["camp", "figura", "ordinare", "cimier", "suporti", "deviza"] as const;
export type Slot = (typeof SLOTS)[number];

export function filledSlots(a: Arms): Slot[] {
  const out: Slot[] = ["camp", "figura"];
  if (a.ordinaries && a.ordinaries.length > 0) out.push("ordinare");
  if (a.crest) out.push("cimier");
  if (a.supporters) out.push("suporti");
  if (a.motto) out.push("deviza");
  return out;
}

/* ───────── Validator ───────── */

export type Severity = "error" | "warn";

export interface Issue {
  code: string;
  severity: Severity;
  message: string;
}

const MOTTO_MAX = 40; // [PLACEHOLDER]

const label = (t: Tincture) => TINCTURES[t].label.toLowerCase();
const clash = (a: Tincture, b: Tincture) => TINCTURES[a].kind === TINCTURES[b].kind;

/** Compară două tincturi care stau una peste alta. */
function contrast(over: Tincture, under: Tincture, what: string, out: Issue[]) {
  if (over === under) {
    out.push({
      code: "invizibil",
      severity: "error",
      message: `${what}: aceeași tinctură (${label(over)}), element invizibil.`,
    });
  } else if (clash(over, under)) {
    out.push({
      code: "regula_tincturilor",
      severity: "warn",
      message: `${what}: ${label(over)} peste ${label(under)} încalcă regula (culoare/metal pe același tip).`,
    });
  }
}

/** Erorile = structură invalidă sau element invizibil.
 *  Avertismentele = încălcarea regulii tincturilor. */
export function validate(a: Arms): Issue[] {
  const out: Issue[] = [];
  const { field, charge } = a;
  const need = PARTITIONS[field.partition].count;

  if (field.tinctures.length !== need) {
    out.push({
      code: "numar_tincturi",
      severity: "error",
      message: `Partiția „${field.partition}” cere ${need} tinctur${need === 1 ? "ă" : "i"}, are ${field.tinctures.length}.`,
    });
    return out; // restul verificărilor depind de câmp
  }

  if (need === 2) {
    const [x, y] = field.tinctures;
    if (x === y) {
      out.push({ code: "camp_identic", severity: "error", message: "Câmpul are două jumătăți de aceeași tinctură." });
    } else if (clash(x, y)) {
      out.push({
        code: "regula_tincturilor",
        severity: "warn",
        message: `Câmp: ${label(x)} și ${label(y)} sunt de același tip.`,
      });
    }
  }

  for (const ft of field.tinctures) contrast(charge.tincture, ft, "Vulpe pe câmp", out);

  const seen = new Set<OrdinaryKind>();
  for (const o of a.ordinaries ?? []) {
    if (seen.has(o.kind)) {
      out.push({ code: "ordinara_dubla", severity: "error", message: `Ordinara „${o.kind}” apare de două ori.` });
    }
    seen.add(o.kind);
    for (const ft of field.tinctures) contrast(o.tincture, ft, `Ordinara ${o.kind} pe câmp`, out);
    if (o.kind === "crucea") contrast(charge.tincture, o.tincture, "Vulpe pe cruce", out);
  }

  if (a.motto !== undefined && a.motto.length > MOTTO_MAX) {
    out.push({ code: "deviza_lunga", severity: "error", message: `Deviza depășește ${MOTTO_MAX} caractere.` });
  }

  return out;
}

/** strict = orice problemă respinge; altfel doar erorile. */
export function isValid(a: Arms, strict: boolean): boolean {
  const issues = validate(a);
  return strict ? issues.length === 0 : !issues.some((i) => i.severity === "error");
}

/* ───────── Generator de blazon (text, română) ───────── */

const de = (t?: Tincture) => (t ? `de ${label(t)}` : "de ?");

export function blazon(a: Arms): string {
  const [x, y] = a.field.tinctures;
  let field: string;
  switch (a.field.partition) {
    case "plin":
      field = `Câmp ${de(x)}`;
      break;
    case "vertical":
      field = `Tăiat vertical ${de(x)} și ${de(y)}`;
      break;
    case "orizontal":
      field = `Tăiat orizontal ${de(x)} și ${de(y)}`;
      break;
    case "diagonal":
      field = `Tăiat diagonal ${de(x)} și ${de(y)}`;
      break;
    case "patratit":
      field = `Pătrățit ${de(x)} și ${de(y)}`;
      break;
  }

  const parts = [field, `o vulpe ${a.charge.attitude} ${de(a.charge.tincture)}`];
  for (const o of a.ordinaries ?? []) parts.push(`${ORDINARIES[o.kind].label} ${de(o.tincture)}`);
  if (a.crest) parts.push(`cimier: ${a.crest}`);
  if (a.supporters) parts.push(`suporți: ${a.supporters}`);
  if (a.motto) parts.push(`deviză: „${a.motto}”`);
  return parts.join(", ") + ".";
}
