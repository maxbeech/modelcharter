import { generatePolicy, policyToMarkdown, POLICY_PRESETS, isPresetId, savedAnswers, type PolicyInput } from "../lib/policy.ts";
import { parsePolicyMarkdown } from "../lib/policy-markdown.ts";
import { eq, ok, done } from "./_assert.mts";

function base(over: Partial<PolicyInput> = {}): PolicyInput {
  return {
    companyName: "Acme Inc", industry: "Software / SaaS", stance: "balanced",
    allowCustomerData: false, allowPersonalData: false, allowCodeGen: false,
    requireDisclosure: false, approvedTools: [], prohibitedTools: [],
    regulations: [], ownerRole: "Head of Operations", effectiveDate: "2026-06-18",
    ...over,
  };
}

const p = generatePolicy(base());
ok(p.title.includes("Acme Inc"), "title includes company name");
ok(p.sections.length >= 5, "has the core sections");

// Sections are numbered sequentially 1..N.
p.sections.forEach((s, i) => ok(s.heading.startsWith(`${i + 1}. `), `section ${i + 1} numbered correctly (${s.heading})`));

// Strict / no-customer-data forbids customer data.
const dataSec = p.sections.find((s) => s.heading.includes("put into AI tools"))!;
const dataText = JSON.stringify(dataSec.body);
ok(dataText.includes("Never enter customer data"), "default forbids customer data");

// allowCustomerData flips the wording.
const allowed = generatePolicy(base({ allowCustomerData: true }));
const allowedText = JSON.stringify(allowed.sections.find((s) => s.heading.includes("put into AI tools"))!.body);
ok(allowedText.includes("approved for that purpose"), "allowing customer data changes wording");

// Coding section only when allowCodeGen.
ok(!p.sections.some((s) => s.heading.includes("coding")), "no coding section by default");
ok(generatePolicy(base({ allowCodeGen: true })).sections.some((s) => s.heading.includes("coding")), "coding section when enabled");

// EU AI Act adds transparency + regulatory clauses.
const eu = generatePolicy(base({ regulations: ["EU AI Act"] }));
ok(eu.sections.some((s) => s.heading.includes("Transparency")), "EU AI Act forces transparency section");
ok(eu.sections.some((s) => s.heading.includes("Regulatory")), "EU AI Act adds regulatory section");
ok(JSON.stringify(eu.sections).includes("AI-literacy"), "EU AI Act clause mentions AI literacy");

// HIPAA clause.
const hipaa = generatePolicy(base({ regulations: ["HIPAA"] }));
ok(JSON.stringify(hipaa.sections).includes("Business Associate Agreement"), "HIPAA clause present");

// Approved tools listed.
const withTools = generatePolicy(base({ approvedTools: ["ChatGPT Enterprise", "Claude for Work"] }));
ok(JSON.stringify(withTools.sections).includes("ChatGPT Enterprise: approved"), "approved tools listed");

// Markdown serialization.
const md = policyToMarkdown(p);
ok(md.startsWith("# Acme Inc AI Usage Policy"), "markdown has H1 title");
ok(md.includes("## 1. Purpose & scope"), "markdown has numbered H2");
ok(md.includes("modelcharter.com"), "markdown has footer attribution");

// Empty company name falls back gracefully.
ok(generatePolicy(base({ companyName: "" })).title.includes("Our company"), "blank company name falls back");

// Healthcare preset and the PHI section.
const hc = POLICY_PRESETS.healthcare;
ok(hc.regulations.includes("HIPAA") && hc.stance === "strict" && !hc.allowPersonalData, "healthcare preset is strict, HIPAA, no PII by default");
ok(isPresetId("healthcare") && !isPresetId("toString") && !isPresetId(null), "only real presets are accepted (no prototype keys)");
const clinic = generatePolicy(base({ ...hc, regulations: [...hc.regulations], companyName: "Riverside Dental", approvedTools: ["ChatGPT", "Midjourney"], baaTools: ["ChatGPT"] }));
const clinicText = JSON.stringify(clinic.sections);
ok(clinic.sections.some((x) => x.heading.endsWith("Patient information (PHI)")), "HIPAA adds a dedicated PHI section");
ok(clinicText.includes("minimum necessary"), "PHI section covers minimum necessary");
ok(clinicText.includes("Riverside Dental's business account"), "PHI section names the practice's business account");
ok(clinicText.includes("ChatGPT: approved. Patient information only through our business account, once a signed BAA covers it"), "a BAA tool is approved for PHI only under a signed BAA");
ok(clinicText.includes("Midjourney: approved for work that contains no patient information"), "a tool without a BAA is approved for non-PHI work only");
ok(!JSON.stringify(generatePolicy(base()).sections).includes("Patient information (PHI)"), "no PHI section without HIPAA");
ok(JSON.stringify(generatePolicy(base({ approvedTools: ["ChatGPT"] })).sections).includes("ChatGPT: approved\""), "without HIPAA approved tools read plainly");
clinic.sections.forEach((x, i) => ok(x.heading.startsWith(`${i + 1}. `), `healthcare section ${i + 1} numbered (${x.heading})`));

// Healthcare wording: the data rules defer to the PHI section, never contradict it.
const careData = clinic.sections.find((x) => x.heading.endsWith("What you may and may not put into AI tools"));
ok(JSON.stringify(careData).includes("Patient information section below allows"), "healthcare data rules point to the PHI section");
ok(!JSON.stringify(careData).includes("customer"), "healthcare data rules talk about patients, not customers");
ok(generatePolicy(base({ ...hc, regulations: [...hc.regulations], companyName: "" })).title === "Our practice AI Usage Policy", "a blank healthcare name reads 'Our practice'");

// The Markdown round trip used by the sign-off page and evidence pack.
const clinicMd = policyToMarkdown(clinic);
const blocks = parsePolicyMarkdown(clinicMd);
eq(blocks[0], { kind: "title", text: "Riverside Dental AI Usage Policy" }, "first block is the title");
ok(blocks.some((b) => b.kind === "heading" && b.text.endsWith("Patient information (PHI)")), "section headings parse");
ok(blocks.some((b) => b.kind === "note" && b.text.startsWith("Effective")), "italic intro lines parse as notes");
ok(blocks.some((b) => b.kind === "list" && b.items.some((i) => i.includes("minimum necessary"))), "bullets parse as a list");
ok(blocks.some((b) => b.kind === "rule"), "the closing rule parses");
ok(!JSON.stringify(blocks).match(/"text":"(#|_|- )/), "no raw markdown markers survive in block text");
eq(parsePolicyMarkdown("Hand-edited line\n\n- a\n- b"), [{ kind: "para", text: "Hand-edited line" }, { kind: "list", items: ["a", "b"] }], "unknown lines stay readable paragraphs");

// Saved answers are read back defensively from input_json.
eq(savedAnswers({ companyName: "Riverside", stance: "strict", regulations: ["HIPAA", 3], allowCodeGen: "yes", junk: 1 }),
  { companyName: "Riverside", stance: "strict", regulations: ["HIPAA"] }, "saved answers keep only well-typed fields");
eq(savedAnswers(null), {}, "no saved input means no answers");
eq(savedAnswers({ stance: "reckless" }), {}, "an unknown stance is dropped");

done("policy");
