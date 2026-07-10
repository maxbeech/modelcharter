// Plain-English definitions of the compliance terms behind the AI Tool Risk
// Directory. Each answers the "what is X" question in the first sentence (GEO),
// then adds context and links related terms.
export interface GlossaryTerm {
  slug: string;        // kebab-case
  term: string;        // "HIPAA BAA"
  aka?: string[];      // alternate phrasings
  short: string;       // ONE-sentence definition, the extractable answer
  keyword: string;     // primary search phrase, e.g. "what is a hipaa baa"
  body: { h?: string; p: string }[];  // 3-5 sections
  related: string[];   // slugs of related terms in this list
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "ai-vendor-risk",
    term: "AI vendor risk assessment",
    aka: ["AI vendor risk", "AI vendor risk review"],
    short:
      "An AI vendor risk assessment is the structured process of checking an AI tool's data handling, certifications and contract terms before it touches company or customer data, plus the written record a reviewer can point to later.",
    keyword: "what is an ai vendor risk assessment",
    body: [
      {
        p: "An AI vendor risk assessment answers one question with evidence: is this tool safe for the data we plan to put through it? That means checking, tool by tool: does it train on your inputs, will the vendor sign a Business Associate Agreement (BAA) or Data Processing Agreement (DPA), does it hold SOC 2 or ISO 27001, where is data stored and processed, who are its subprocessors, and what plan tier is actually required to get those protections (the free tier of a tool is frequently a different risk profile than its business tier).",
      },
      {
        h: "How it differs from a normal vendor review",
        p: "It is a variant of the vendor risk assessments security teams already run for any SaaS purchase, adapted for what is specific to AI: model training on your inputs, prompt and output retention, and whether a human reviewer might ever see what you submit. General vendor-risk questionnaires often miss these because they were written before generative AI existed.",
      },
      {
        h: "The output is a document, not a verdict in someone's head",
        p: "The output should be a document, not a verdict in someone's head: a short write-up of what was checked, what the vendor's own trust center or DPA says (with a source link for each claim), and a plan-tier recommendation ('Business tier only, never the free consumer plan'). That document is what an auditor, a customer's security questionnaire, or your own future self needs when the same question comes up again in six months.",
      },
      {
        h: "Treat it as a living record",
        p: "Because vendor policies change (a training default shifts, a new subprocessor is added, a BAA becomes available), a one-time assessment goes stale. Treat it as a living record with a re-check cadence, not a form you fill in once and file away. ModelCharter's free AI vendor risk assessment tool walks through exactly these checks, and the AI Tool Risk Directory has already sourced the answers for the most common tools.",
      },
    ],
    related: ["shadow-ai", "hipaa-baa", "gdpr-dpa", "soc-2"],
  },
  {
    slug: "data-residency",
    term: "Data residency",
    aka: ["data location", "where your data is stored"],
    short:
      "Data residency is where an AI vendor actually stores and processes your data, meaning which country or region and under which legal jurisdiction, as distinct from where the vendor is headquartered.",
    keyword: "what is data residency",
    body: [
      {
        p: "Data residency describes the physical and legal location of the servers and data centers where your inputs, outputs and account data are stored and processed. It matters because data stored in a given jurisdiction is generally subject to that jurisdiction's laws, including government access requests, regardless of where your company or your users are based.",
      },
      {
        h: "Why AI makes residency harder",
        p: "For AI tools specifically, residency questions get more complicated than for plain SaaS storage, because a prompt often gets processed by more than one system: the vendor's own infrastructure, a cloud provider underneath it, and sometimes a separate model provider entirely (a chat product built on someone else's foundation model, for instance). Each of those legs can sit in a different region unless the vendor explicitly commits otherwise.",
      },
      {
        h: "US by default, EU or UK by upgrade",
        p: "Most AI vendors default to US-based processing, since that is where the major cloud and model infrastructure is concentrated. EU and UK data residency, when offered, is typically an enterprise-tier feature, an explicit commitment that data stays within EU data centers, not the out-of-the-box behaviour of the free or standard plan.",
      },
      {
        h: "Confirm it in writing",
        p: "If residency is a hard requirement (common in finance, public sector and some healthcare contexts), don't infer it from a vendor being 'GDPR compliant' generally: GDPR compliance and EU data residency are different guarantees. Residency is also not the same as data sovereignty, which adds the question of which country's laws ultimately govern access even when the data is stored abroad. Confirm residency specifically, in writing, for the plan tier you will actually be on; the AI Tool Risk Directory notes residency options where vendors publish them.",
      },
    ],
    related: ["gdpr-dpa", "subprocessor", "soc-2"],
  },
  {
    slug: "gdpr-dpa",
    term: "GDPR Data Processing Agreement (DPA)",
    aka: ["DPA", "data processing agreement"],
    short:
      "A GDPR Data Processing Agreement (DPA) is the contract GDPR requires between a data controller (you) and a data processor (the AI vendor) before the vendor may process personal data of EU or UK individuals on your behalf.",
    keyword: "what is a gdpr dpa",
    body: [
      {
        p: "Under the EU and UK GDPR, whenever you (the 'controller') use a vendor (the 'processor') to process personal data, Article 28 requires a written contract, the Data Processing Agreement, that binds the processor to specific obligations: processing data only on your documented instructions, keeping it confidential, implementing appropriate security, assisting with data-subject requests, notifying you of breaches, and either deleting or returning data at the end of the relationship. Without a DPA in place, using the vendor on EU or UK personal data is itself a compliance gap.",
      },
      {
        h: "The DPA is where the real detail lives",
        p: "For AI tools, the DPA is usually where the vendor's subprocessor list, data-retention commitments and international-transfer mechanism (Standard Contractual Clauses, an adequacy decision, or the EU-US Data Privacy Framework) actually live, more so than the public privacy policy, which is written for end users rather than for compliance review. When you are checking GDPR readiness, the DPA is the document to actually read, not just confirm exists.",
      },
      {
        h: "Necessary, but not the whole story",
        p: "A DPA is necessary but doesn't answer every GDPR question on its own. You still need to confirm the lawful basis for the processing, whether the tool supports data-subject rights in practice (export, deletion), and whether EU data residency is offered if that matters for your risk tolerance: some vendors process globally by default and only add regional options on higher tiers.",
      },
      {
        h: "Now table stakes for business tools",
        p: "Almost every AI vendor aimed at business customers now offers a standard DPA; it has become table stakes rather than a differentiator. Where vendors genuinely differ is EU data residency, subprocessor transparency, and whether the DPA is available to every plan or gated to enterprise contracts. ModelCharter's GDPR compliance hub and the AI Tool Risk Directory flag which tools publish a DPA.",
      },
    ],
    related: ["hipaa-baa", "subprocessor", "data-residency"],
  },
  {
    slug: "hipaa-baa",
    term: "HIPAA Business Associate Agreement (BAA)",
    aka: ["BAA", "business associate agreement"],
    short:
      "A HIPAA Business Associate Agreement (BAA) is a contract required under HIPAA before any vendor may receive, process or store Protected Health Information (PHI) on a covered entity's behalf; with no signed BAA, no PHI may go into that tool.",
    keyword: "what is a hipaa baa",
    body: [
      {
        p: "HIPAA (the US Health Insurance Portability and Accountability Act) requires that any 'business associate', a vendor that creates, receives, maintains or transmits PHI on behalf of a healthcare provider, insurer or their contractors, sign a Business Associate Agreement before it touches that data. The BAA obligates the vendor to specific safeguards and breach-notification duties, and makes it directly liable under HIPAA rather than just contractually to its customer.",
      },
      {
        h: "Why it matters most for AI",
        p: "For AI tools specifically, this matters because a huge share of AI adoption in healthcare-adjacent settings is unofficial: a clinician trying a transcription app, a practice manager summarising intake forms with a chatbot. If the vendor hasn't signed a BAA, putting PHI through that tool is a HIPAA violation regardless of how good the tool's underlying security is: the BAA is the legal gate, not a formality.",
      },
      {
        h: "Usually a paid-tier feature",
        p: "Signing a BAA is usually restricted to a vendor's paid business or enterprise tier; free and consumer tiers of the same product frequently do not qualify, even when the vendor offers a BAA at all. That is why 'does this tool sign a BAA' and 'on which plan' are two separate questions, and both need a sourced answer, not an assumption based on the product's general reputation.",
      },
      {
        h: "Who offers one",
        p: "Some vendors are explicit that they don't offer a BAA at all: Otter.ai has stated publicly it is not HIPAA compliant and does not sign BAAs. Others, like OpenAI, Anthropic, Google and Microsoft, do sign a BAA on their business or enterprise tiers. Always confirm the current position from the vendor's own trust center before assuming either way. ModelCharter's HIPAA compliance hub and the AI Tool Risk Directory record which tools offer a BAA and on which tier.",
      },
    ],
    related: ["gdpr-dpa", "soc-2", "training-opt-out"],
  },
  {
    slug: "iso-27001",
    term: "ISO 27001",
    aka: ["ISO/IEC 27001"],
    short:
      "ISO 27001 is an internationally recognised certification confirming that a company runs a formal information security management system (ISMS), an ongoing programme rather than a one-time checklist.",
    keyword: "what is iso 27001",
    body: [
      {
        p: "ISO/IEC 27001 is a standard published by the International Organization for Standardization that specifies requirements for an information security management system: how a company identifies risks, sets controls, assigns ownership, and continually reviews and improves its security practices. Certification is issued by an accredited third-party auditor after a formal audit, and requires periodic surveillance audits (typically annual) to stay valid; it isn't a badge earned once and kept forever.",
      },
      {
        h: "How it compares to SOC 2",
        p: "Where SOC 2 is common in the US and reports on specific control operation over a period, ISO 27001 is the more globally recognised standard and certifies the management system itself: the governance and process discipline around security, not just a snapshot of specific controls. Many enterprise buyers, especially outside the US, will ask for ISO 27001 specifically, and some now also look for the newer ISO/IEC 42001 standard, which extends the same management-system approach specifically to AI systems.",
      },
      {
        h: "What it doesn't tell you",
        p: "As with SOC 2, ISO 27001 says nothing on its own about whether a vendor trains on your data or signs a BAA; treat it as evidence of security-program maturity, and check the AI-specific data-handling questions separately and directly.",
      },
      {
        h: "Check the scope",
        p: "Certification is usually company-wide or scoped to specific product lines rather than universal, so it is worth confirming the certificate's scope actually covers the AI product you are evaluating, not just the vendor's other services. ModelCharter's ISO 27001 compliance hub lists AI tools that hold a current certificate.",
      },
    ],
    related: ["soc-2", "hipaa-baa", "gdpr-dpa"],
  },
  {
    slug: "model-training-on-data",
    term: "Model training on your data",
    aka: ["training on your data", "does it train on your data"],
    short:
      "Model training on your data is whether an AI vendor uses the content you submit, meaning prompts, uploads and generated outputs, to train or fine-tune its models for other users, as opposed to keeping it isolated to your own session.",
    keyword: "what is model training on your data",
    body: [
      {
        p: "This is the single most-asked question about any AI tool, and the answer is rarely a flat yes or no. Vendors describe their posture along a spectrum: training on everything by default with no opt-out; training by default with an opt-out available; not training unless you explicitly opt in; or not training at all on a given tier. The same product can sit in different places on that spectrum depending on which plan you are on, which is why a tool's overall brand reputation is a poor substitute for checking the specific tier.",
      },
      {
        h: "The common tier-based pattern",
        p: "The most common pattern among major assistants is 'tier-based': the free or consumer plan trains on conversations by default (sometimes with human review as part of that process), while the paid business, enterprise or API tier is excluded from training entirely as part of the commercial terms. ChatGPT is a clear example of this split: Business, Enterprise and API usage is excluded by default, while the free and Plus consumer product trains unless you turn that off yourself.",
      },
      {
        h: "'Not trained on' is not 'not retained'",
        p: "'Not trained on' and 'not retained at all' are also different claims worth separating. A vendor can exclude your data from model training while still retaining it for a period for abuse monitoring, debugging or legal holds. If retention length matters for your use case, check the data-retention specifics, not just the training answer.",
      },
      {
        h: "Treat the answer as dated",
        p: "Because this fact changes as vendors update their terms, and because it depends on plan tier, treat any answer as time-stamped. A sourced, dated fact from the vendor's own trust center or enterprise-privacy page beats a general impression, however confident that impression feels. The AI Tool Risk Directory states each tool's sourced training posture with a link to the vendor's own documentation, and the no-training compliance hub lists tools that do not train on your inputs.",
      },
    ],
    related: ["training-opt-out", "subprocessor", "shadow-ai"],
  },
  {
    slug: "shadow-ai",
    term: "Shadow AI",
    aka: ["shadow IT for AI", "unapproved AI tools"],
    short:
      "Shadow AI is AI tools that employees adopt on their own, such as a personal ChatGPT account, a browser extension or a free transcription app, without IT or security ever approving or even knowing about them.",
    keyword: "what is shadow ai",
    body: [
      {
        p: "Shadow AI is the AI-tool version of shadow IT: software an organisation is using that never went through a security review, a procurement process, or even a conversation with the people responsible for data protection. It shows up because AI tools are frictionless to adopt, with no purchase order, no install, and often no sign-up beyond an email address, and because employees are under real pressure to move faster, so they reach for whatever works.",
      },
      {
        h: "The risk is the tier, not carelessness",
        p: "The risk isn't that employees are being careless. It is that a consumer-tier AI account frequently has a different data policy than the enterprise tier of the same product. A free ChatGPT or Otter.ai account, for example, can have a different training posture, retention window, or compliance status than the business plan of the exact same tool, so the same product name can mean two very different risk profiles depending on which tier someone happens to be signed up on.",
      },
      {
        h: "When it becomes a real problem",
        p: "Shadow AI becomes a real problem the moment sensitive data enters the picture: a support rep pastes a customer's details into a chatbot to draft a reply, a clinician runs patient notes through a free transcription tool, a paralegal uploads a contract to get a summary. None of that shows up on an approved-vendor list, so none of it gets vetted, and none of it gets picked up if the vendor's policy quietly changes.",
      },
      {
        h: "The fix is visibility, not a ban",
        p: "The fix is not a ban; bans just push usage further into the shadows. It is visibility (a living register of what is actually in use), a fast lane for getting new tools vetted so people aren't stuck waiting weeks, and clear tiering guidance ('use the Business plan, not the free one') so the tools people already like become safe to keep using. ModelCharter's team dashboard keeps that tool register, and the AI Tool Risk Directory provides the sourced facts to vet each entry.",
      },
    ],
    related: ["ai-vendor-risk", "training-opt-out", "model-training-on-data"],
  },
  {
    slug: "soc-2",
    term: "SOC 2",
    aka: ["SOC 2 Type II", "System and Organization Controls 2"],
    short:
      "SOC 2 is an independent audit report, issued by an outside CPA firm rather than the vendor itself, confirming that a company's security, availability and confidentiality controls actually work as claimed over a period of time.",
    keyword: "what is soc 2",
    body: [
      {
        p: "SOC 2 (System and Organization Controls 2) is an auditing standard from the American Institute of CPAs. A vendor doesn't 'pass' SOC 2 once; an independent auditor examines its controls against the relevant Trust Services Criteria (security is mandatory; availability, confidentiality, processing integrity and privacy are optional add-ons) and issues a report. The result isn't public certification like a badge; it is a private report the vendor shares under NDA, usually via a trust-center portal.",
      },
      {
        h: "Type I versus Type II",
        p: "Two report types matter for buyers. A Type I report checks whether controls are designed correctly at a single point in time. A Type II report, the one worth asking for, checks whether those controls actually operated effectively over an observation window, typically six or twelve months. Type II is meaningfully stronger evidence than Type I, because it is evidence of sustained practice, not a one-day snapshot.",
      },
      {
        h: "What SOC 2 doesn't cover",
        p: "For AI tools, SOC 2 doesn't say anything directly about whether the vendor trains on your data or will sign a BAA; those are separate, specific questions. What it does say is that an outside party has verified the vendor has real security operations: access controls, monitoring, incident response, change management. Treat it as a baseline hygiene signal, not a complete answer to 'is this tool safe for our data.'",
      },
      {
        h: "Who holds one",
        p: "Most major AI vendors, OpenAI, Anthropic, Google, Microsoft, GitHub, Grammarly, Notion, Zoom, Otter.ai, Cursor and Perplexity among them, hold a SOC 2 Type II report. A handful of consumer-first tools, like Midjourney, do not publicly document one; that gap is itself useful information when you are comparing options. ModelCharter's SOC 2 compliance hub and the AI Tool Risk Directory record each tool's SOC 2 status.",
      },
    ],
    related: ["iso-27001", "hipaa-baa", "gdpr-dpa"],
  },
  {
    slug: "subprocessor",
    term: "Subprocessor",
    aka: ["sub-processor", "fourth party"],
    short:
      "A subprocessor is a third party an AI vendor relies on to deliver its service, such as a cloud host, a model provider or an analytics tool, that also ends up touching your data even though you never signed a contract with it directly.",
    keyword: "what is a subprocessor",
    body: [
      {
        p: "A subprocessor is any vendor your vendor uses. Under GDPR, a processor (the AI tool you contracted with) is required to disclose the subprocessors it engages to handle personal data on its behalf, and to get your consent (often via a standing notification process) before adding new ones. In practice this means an AI product's real data footprint is rarely just the vendor you signed up with; it is that vendor plus everyone underneath it.",
      },
      {
        h: "Why it matters more for AI",
        p: "For AI tools this list is often more consequential than for ordinary SaaS, because it commonly includes the underlying foundation-model provider. A product built as a wrapper around someone else's model may send your prompts to that model provider as a subprocessor, meaning the training and retention posture of the underlying model matters just as much as the posture of the product you are actually using.",
      },
      {
        h: "Look for a published list",
        p: "Reputable vendors publish a subprocessor list (often at a URL like '/subprocessors' or inside the DPA) and commit to notifying customers before adding new ones. A vendor that won't disclose its subprocessors at all is a meaningful gap; you can't assess a risk chain you can't see.",
      },
      {
        h: "Check it is current and reachable",
        p: "When reviewing a tool, check not just whether a subprocessor list exists, but whether it is current and whether it is actually reachable from the product's trust center or DPA; a list that is promised but not published isn't useful for a review. ModelCharter's free AI vendor risk assessment tool includes subprocessor disclosure as one of its checks.",
      },
    ],
    related: ["gdpr-dpa", "data-residency", "model-training-on-data"],
  },
  {
    slug: "training-opt-out",
    term: "Training opt-out",
    aka: ["opt out of AI training", "AI data training toggle"],
    short:
      "A training opt-out is the setting, sometimes a toggle and sometimes just a plan upgrade, that stops an AI vendor from using your prompts, uploads or conversations to train or improve its models.",
    keyword: "what is a training opt-out",
    body: [
      {
        p: "Many consumer AI products train on user activity by default: your prompts and the model's responses may be reviewed by humans and used to improve future model versions, unless you take an explicit action to stop it. A training opt-out is that action, a setting in your account (often called something like 'Improve the model for everyone' or 'AI data retention') that, once disabled, excludes your data from that pipeline going forward.",
      },
      {
        h: "The mechanism varies by vendor",
        p: "The mechanism differs a lot by vendor and by plan. Some tools give consumers a real, self-service toggle. Others make training exclusion an automatic feature of paid business or enterprise tiers rather than something you switch off yourself: you get the exclusion by being on the right plan, not by finding a setting. And a few products do not offer an opt-out at all on any tier, meaning training use is simply a condition of using the product.",
      },
      {
        h: "Two caveats worth knowing",
        p: "Two caveats matter. First, opting out is rarely retroactive: it usually stops future data from being used, without necessarily removing what was already ingested previously. Second, 'opt-out' and 'opt-in' are opposite defaults with very different risk profiles: opt-out means you are being trained on unless you act, opt-in means you are safe by default unless you deliberately choose to contribute data. Always check which direction a given tool defaults to.",
      },
      {
        h: "The tier gap again",
        p: "Business and enterprise tiers of major assistants, such as ChatGPT Business, Enterprise and API, Claude's commercial and API access, Microsoft 365 Copilot, and GitHub Copilot Business and Enterprise, are generally excluded from training by default, in contrast to their free consumer equivalents. That gap between tiers is exactly why 'does this product train on your data' needs a tier-specific answer, not a single yes or no for the whole brand. The no-training compliance hub and the AI Tool Risk Directory record each tool's opt-out mechanism and default.",
      },
    ],
    related: ["model-training-on-data", "shadow-ai", "hipaa-baa"],
  },
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
