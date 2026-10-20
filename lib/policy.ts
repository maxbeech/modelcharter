// AI Usage Policy generator — the core free tool.
//
// A PURE function: given the answers from the generator form it returns a
// structured, tailored policy document. No network, no randomness, fully
// testable. The output is real, usable policy text that adapts to the company's
// industry, risk stance, data rules and applicable regulations. Sections are
// built unnumbered and numbered in one pass at the end (robust to optional
// sections being added or removed).

export type Stance = "permissive" | "balanced" | "strict";

export interface PolicyInput {
  companyName: string;
  industry: string;
  stance: Stance;
  allowCustomerData: boolean; // may staff input customer/confidential data?
  allowPersonalData: boolean; // may staff input personal data (PII)?
  allowCodeGen: boolean; // is AI-assisted coding in scope?
  requireDisclosure: boolean; // must AI-generated external content be disclosed?
  approvedTools: string[]; // names of tools explicitly approved
  prohibitedTools: string[]; // names of tools explicitly banned
  regulations: string[]; // e.g. ["EU AI Act", "GDPR", "HIPAA", "SOC 2"]
  ownerRole: string; // who owns AI governance, e.g. "Head of Operations"
  effectiveDate: string; // ISO date
  baaTools?: string[]; // names of tools whose vendor offers a HIPAA BAA (from the directory)
}

// Starting answers for a type of organisation. Applied by the generator when
// the page is opened with ?preset=<id>. Only answers change; the wording still
// comes from generatePolicy, so a preset can never drift from the clauses.
export const POLICY_PRESETS = {
  healthcare: {
    industry: "Healthcare",
    stance: "strict" as Stance,
    ownerRole: "Practice Manager (HIPAA Privacy Officer)",
    allowCustomerData: false,
    allowPersonalData: false,
    allowCodeGen: false,
    requireDisclosure: true,
    regulations: ["HIPAA"],
  },
} as const;

export type PresetId = keyof typeof POLICY_PRESETS;

/** The editable answers, read back from a saved version's input_json. Unknown or mistyped fields are dropped. */
export type SavedAnswers = Partial<Pick<PolicyInput, "companyName" | "industry" | "stance" | "ownerRole" | "allowCustomerData" | "allowPersonalData" | "allowCodeGen" | "requireDisclosure" | "regulations">>;

export function savedAnswers(raw: unknown): SavedAnswers {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: SavedAnswers = {};
  for (const k of ["companyName", "industry", "ownerRole"] as const) if (typeof r[k] === "string") out[k] = r[k] as string;
  for (const k of ["allowCustomerData", "allowPersonalData", "allowCodeGen", "requireDisclosure"] as const) if (typeof r[k] === "boolean") out[k] = r[k] as boolean;
  if (r.stance === "permissive" || r.stance === "balanced" || r.stance === "strict") out.stance = r.stance;
  if (Array.isArray(r.regulations)) out.regulations = r.regulations.filter((x): x is string => typeof x === "string");
  return out;
}

export const isPresetId = (v: string | null | undefined): v is PresetId =>
  v != null && Object.prototype.hasOwnProperty.call(POLICY_PRESETS, v);

export interface PolicySection { heading: string; body: (string | string[])[] }
export interface Policy { title: string; intro: string[]; sections: PolicySection[] }

const STANCE_TONE: Record<Stance, string> = {
  permissive:
    "{company} encourages the use of AI tools to work faster and better. This policy sets the small number of firm rules that keep that experimentation safe.",
  balanced:
    "{company} supports the responsible use of AI tools. This policy explains what is allowed, what is not, and the steps everyone must follow to protect our data and our customers.",
  strict:
    "{company} permits AI tools only within the controls set out below. Because of the sensitivity of the data we handle, anything not explicitly allowed here is prohibited until approved.",
};

const fill = (s: string, company: string) => s.replaceAll("{company}", company);

export function generatePolicy(input: PolicyInput): Policy {
  // A healthcare policy talks about the practice and its patients.
  const care = input.industry === "Healthcare";
  const orgNoun = care ? "practice" : "company";
  const c = input.companyName.trim() || (care ? "Our practice" : "Our company");
  const owner = input.ownerRole.trim() || "AI policy owner";
  const s: PolicySection[] = [];

  s.push({
    heading: "Purpose & scope",
    body: [
      `This AI Usage Policy applies to all employees, contractors and anyone acting on behalf of ${c} who uses artificial-intelligence tools. This includes general assistants (such as ChatGPT, Claude and Gemini), AI features built into software you already use, and any tool that sends our data to a third-party model.`,
      "It covers how these tools may be used, what data may and may not be entered into them, and who to ask when you are unsure.",
    ],
  });

  s.push({
    heading: "Our approach to AI",
    body: [
      fill(STANCE_TONE[input.stance], c),
      [
        "Use AI to assist your work, not to replace your judgement. You remain accountable for anything you produce with AI.",
        "Never enter data into an AI tool that you would not be comfortable sending to an untrusted third party.",
        "When in doubt, ask before you paste.",
      ],
    ],
  });

  const toolBody: (string | string[])[] = [
    `${c} keeps a register of AI tools and the status of each. Only use tools that are Approved for the data you are working with.`,
  ];
  const hipaa = input.regulations.includes("HIPAA");
  const baa = new Set(input.baaTools ?? []);
  if (input.approvedTools.length)
    toolBody.push("Currently approved tools:", input.approvedTools.map((t) => !hipaa
      ? `${t}: approved`
      : baa.has(t)
        ? `${t}: approved. Patient information only through our business account, once a signed BAA covers it`
        : `${t}: approved for work that contains no patient information`));
  else
    toolBody.push("The approved-tools list is maintained separately and shared with all staff. If a tool is not on it, treat it as not yet approved.");
  if (input.prohibitedTools.length)
    toolBody.push("Tools that must not be used for work:", input.prohibitedTools.map((t) => `${t}: prohibited`));
  toolBody.push(`To request a new tool, contact the ${owner}. New tools are assessed for how they handle our data before approval.`);
  s.push({ heading: "Approved tools", body: toolBody });

  const dataRules: string[] = [];
  const phiNote = input.regulations.includes("HIPAA") ? " The only exception is patient information handled exactly as the Patient information section below allows." : "";
  if (care) dataRules.push(input.allowCustomerData
    ? "Confidential practice information (finances, contracts, staff records) may only be used with tools approved for that purpose, and only where the vendor does not train its models on our data."
    : `Never enter confidential practice information (finances, contracts, staff records) into an AI tool.`);
  else dataRules.push(input.allowCustomerData
    ? "Customer or confidential business data may only be used with tools approved for that purpose, and only where the vendor does not train its models on our data."
    : "Never enter customer data, confidential business information, trade secrets or unreleased plans into any AI tool.");
  dataRules.push(input.allowPersonalData
    ? `Personal data (information that identifies an individual) may be used only with an approved tool that offers a Data Processing Addendum, and only where strictly necessary.${phiNote}`
    : `Never enter personal data (names, emails, ${care ? "patient" : "customer"} records or any information that identifies an individual) into an AI tool.${phiNote}`);
  dataRules.push("Never enter credentials, API keys, passwords or secrets.");
  dataRules.push("Assume anything you type into a consumer AI tool may be retained by the vendor and, on free tiers, used to train their models.");
  s.push({
    heading: "What you may and may not put into AI tools",
    body: [`The single most important rule is controlling what data leaves the ${orgNoun}.`, dataRules],
  });

  if (hipaa) {
    s.push({
      heading: "Patient information (PHI)",
      body: [
        "Protected health information (PHI) is any health information that could identify a patient: names, dates, contact details, record numbers, photos, and anything else taken from a patient's record.",
        [
          `Only put PHI into a tool that ${c} has a signed Business Associate Agreement (BAA) for, and only through ${c}'s business account. Never a personal or free account.`,
          "Use the minimum necessary. Leave out names, dates of birth and record numbers whenever the task works without them.",
          "Removing a name alone does not make information safe. If a patient could still be identified, treat it as PHI.",
          "Check every AI-drafted note, letter or summary before it goes into a record or to a patient. AI can get clinical details wrong.",
          "AI can support clinical work but never makes a diagnosis or treatment decision on its own.",
          "Ask the patient before recording a conversation with an AI scribe or note-taker, and follow your state's consent rules.",
          `If PHI goes into a tool that isn't covered by a BAA, tell the ${owner} the same day. It may be a breach that has to be assessed and reported.`,
        ],
      ],
    });
  }

  if (input.allowCodeGen) {
    s.push({
      heading: "AI-assisted coding",
      body: [
        "AI coding assistants are permitted for approved repositories.",
        [
          "Do not paste secrets, customer data or proprietary source from unrelated systems into a coding assistant.",
          "Review all AI-generated code before merging. You are responsible for its correctness, security and licence compliance.",
          "Use the business/enterprise tier of coding assistants where available, as it excludes your code from training.",
        ],
      ],
    });
  }

  if (input.requireDisclosure || input.regulations.includes("EU AI Act")) {
    s.push({
      heading: "Transparency & disclosure",
      body: [
        "Be honest about AI's involvement in your work.",
        [
          "Clearly tell people when they are interacting with an AI system rather than a person (e.g. an AI chat or phone agent).",
          "Label AI-generated or substantially AI-edited images, audio and video where it could mislead.",
          "Do not present AI output as the reviewed work of a named expert without their review.",
        ],
      ],
    });
  }

  const regBody: string[] = [];
  if (input.regulations.includes("HIPAA"))
    regBody.push("HIPAA: Protected Health Information (PHI) may only be used with a tool covered by a signed Business Associate Agreement (BAA). No PHI in consumer AI tools, ever.");
  if (input.regulations.includes("GDPR"))
    regBody.push("GDPR: Personal data of EU/UK individuals may only be processed with a tool that offers a DPA and an appropriate transfer mechanism. Minimise what you input.");
  if (input.regulations.includes("EU AI Act"))
    regBody.push(`EU AI Act: We do not use prohibited AI practices. Anyone using AI on our behalf must complete the AI-literacy basics, and high-risk uses (e.g. hiring or credit decisions) require sign-off from the ${owner}.`);
  if (input.regulations.includes("SOC 2"))
    regBody.push("SOC 2: AI tools are governed as subprocessors. Confidential data must not be entered into unapproved tools, and staff acknowledgement of this policy is recorded as evidence.");
  if (input.regulations.includes("ISO 42001"))
    regBody.push("ISO 42001: This policy, the tool register and our AI risk assessment form part of our AI management system, reviewed on a defined cycle.");
  if (regBody.length)
    s.push({ heading: "Regulatory obligations", body: ["The following apply to us specifically:", regBody] });

  s.push({
    heading: "Responsibilities & breaches",
    body: [
      `The ${owner} owns this policy, maintains the approved-tools register, and is the point of contact for questions and tool requests.`,
      `Everyone is responsible for following this policy. Suspected data exposure through an AI tool must be reported to the ${owner} immediately so it can be contained.`,
      "Breaches may lead to loss of AI-tool access and, for serious or repeated breaches, disciplinary action.",
      `This policy takes effect on ${input.effectiveDate} and will be reviewed at least annually.`,
    ],
  });

  // Number sections in one pass.
  const sections = s.map((sec, i) => ({ ...sec, heading: `${i + 1}. ${sec.heading}` }));

  return {
    title: `${c} AI Usage Policy`,
    intro: [
      `Effective ${input.effectiveDate}. Owner: ${owner}.`,
      `This is ${c}'s policy on the use of artificial-intelligence tools at work. Please read it before using any AI tool for your job.`,
    ],
    sections,
  };
}

export function policyToMarkdown(p: Policy): string {
  const lines: string[] = [`# ${p.title}`, ""];
  for (const i of p.intro) lines.push(`_${i}_`, "");
  for (const sec of p.sections) {
    lines.push(`## ${sec.heading}`, "");
    for (const b of sec.body) {
      if (Array.isArray(b)) { for (const li of b) lines.push(`- ${li}`); lines.push(""); }
      else { lines.push(b, ""); }
    }
  }
  lines.push("---", "_Generated with ModelCharter (modelcharter.com). Review with your own legal or compliance advisor before adopting._");
  return lines.join("\n");
}
