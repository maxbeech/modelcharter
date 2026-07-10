// SEO guide posts targeting the AI-governance keyword cluster. Bodies are
// arrays of {h?, p} sections rendered by the blog page. Single source for the
// blog index + sitemap. Content is grounded and links to our tools/frameworks.

export interface PostSection { h?: string; p: string }
export interface PostImage {
  src: string;
  alt: string;
  author: string;
  authorUrl: string;
}
export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  keyword: string;
  body: PostSection[];
  image?: PostImage;
}

export const POSTS: Post[] = [
  {
    slug: "what-is-ai-governance",
    title: "What Is AI Governance? A Practical Guide for Small Teams",
    date: "2026-06-18",
    description: "AI governance explained without the jargon: what it is, why even small companies need it, and the three artefacts that cover most of it.",
    keyword: "ai governance",
    body: [
      { p: "AI governance is simply how an organisation sets and enforces rules for using AI safely and legally. It sounds like something only big, regulated companies do, but the moment anyone on your team pastes work into ChatGPT, you have AI risk, and governance is how you manage it." },
      { h: "The three things that cover most of it", p: "You don't need a department. For most small and mid-sized teams, AI governance comes down to three artefacts: (1) an AI usage policy that says what's allowed and what isn't; (2) a register of which AI tools are approved and for what data; and (3) a record that staff have read and acknowledged the policy." },
      { h: "Why it matters now", p: "Three forces converged across 2025 and 2026: AI tools became ubiquitous at work, regulators acted (the EU AI Act's AI-literacy duty applied from February 2025), and enterprise buyers started asking about AI in SOC 2 and security reviews. Not having a policy is now something customers and auditors notice." },
      { h: "Shadow AI is the real risk", p: "The biggest day-one risk isn't a rogue model. It's 'shadow AI': employees quietly using unapproved tools on personal accounts that may train on or retain your confidential data. A clear policy plus an approved-tools list is the cheapest way to pull that into the light." },
      { h: "Where to start", p: "Generate an AI usage policy (it's a short job), check your most-used AI tools in a risk directory so you know which to approve, and circulate the policy for everyone to acknowledge. That alone puts you ahead of most companies your size." },
    ],
  },
  {
    slug: "what-is-shadow-ai",
    title: "What Is Shadow AI, and How Do You Get It Under Control?",
    date: "2026-06-18",
    description: "Shadow AI is employees using unapproved AI tools at work. Here's why it happens, the risk it creates, and how to fix it without banning AI.",
    keyword: "shadow ai",
    body: [
      { p: "Shadow AI is the use of AI tools that your organisation hasn't approved or doesn't even know about: marketing running ChatGPT on personal accounts, support installing an AI browser extension, an engineer pasting code into a free assistant. It's the AI version of 'shadow IT'." },
      { h: "Why it happens", p: "Because AI tools are useful and free, and approval is slow or non-existent. People aren't being reckless; they're trying to do their jobs faster. Banning AI outright just drives it further underground." },
      { h: "The risk", p: "Consumer/free tiers of many AI tools train on your inputs by default and retain data. Confidential plans, customer data and source code entered into them can leak into model training or be exposed in a breach, and you have no record it happened." },
      { h: "How to control it (without a ban)", p: "Give people an approved path. Publish a short AI usage policy, maintain a list of approved tools (with the safe tiers named), and make it easy to request new ones. When the sanctioned route is as easy as the shadow one, shadow AI shrinks." },
      { h: "Know your tools", p: "Start by checking how your most-used AI tools actually handle data: whether they train on it, their retention, and whether they offer a business tier that doesn't. Our AI Tool Risk Directory rates the popular ones from their own policies." },
    ],
  },
  {
    slug: "how-to-write-an-ai-usage-policy",
    title: "How to Write an AI Usage Policy (with a Free Template)",
    date: "2026-06-18",
    description: "A step-by-step guide to writing an AI usage policy for your company: what to include, how strict to be, and a free generator that does it for you.",
    keyword: "ai usage policy template",
    body: [
      { p: "An AI usage policy tells your team how they may and may not use AI tools at work. A good one is short, specific and easy to follow, not a 20-page legal document nobody reads." },
      { h: "1. Define the scope", p: "Say who it applies to (employees, contractors, anyone acting for you) and what counts as an 'AI tool': standalone assistants, AI features baked into other software, and anything that sends your data to a third-party model." },
      { h: "2. Set your stance", p: "Decide how permissive to be. Most teams land on 'balanced': AI is allowed, with guardrails. Regulated or data-sensitive teams go stricter, allowing only explicitly approved tools and uses." },
      { h: "3. Nail the data rules", p: "This is the heart of the policy. Be explicit about customer data, personal data (PII), secrets and confidential plans. The simplest safe default: never put confidential or personal data into a consumer AI tool, and only use approved tools that don't train on your data for anything sensitive." },
      { h: "4. Add transparency and regulatory clauses", p: "If you have EU users, the EU AI Act expects you to disclose AI interactions and ensure basic AI literacy. If you handle health data, HIPAA needs a BAA. If you sell B2B, SOC 2 auditors expect this policy to exist." },
      { h: "5. Name an owner and generate it", p: "Say who owns the policy and handles questions and breaches. Then don't start from a blank page: our free AI usage policy generator builds all of the above, tailored to your answers, in a couple of minutes." },
    ],
  },
  {
    slug: "eu-ai-act-for-small-business",
    title: "The EU AI Act for Small Businesses: What You Actually Have to Do",
    date: "2026-06-18",
    description: "Does the EU AI Act apply to your small business? The realistic obligations for a small team that just uses AI tools, and what you can ignore.",
    keyword: "eu ai act compliance",
    body: [
      { p: "The EU AI Act is the world's first comprehensive AI law, and the headlines make it sound terrifying. For a small business that simply uses AI tools (rather than building high-risk AI systems), the real obligations are more manageable than they look." },
      { h: "Does it apply to you?", p: "If your business or its output reaches the EU (EU customers, or EU-based staff using AI on your behalf) then yes, it can apply, even if you're based outside the EU." },
      { h: "You're probably a 'deployer', not a 'provider'", p: "The heaviest duties fall on providers of high-risk AI systems. Most small teams are deployers of general tools like ChatGPT, so the practical duties are: don't use banned practices, ensure basic AI literacy among staff, and be transparent (tell people when they're dealing with AI or AI-generated content)." },
      { h: "The AI-literacy duty", p: "Since February 2025, you must ensure staff who use AI have a sufficient level of AI literacy. A written AI usage policy plus a short briefing is the simplest way to evidence this: you have a document and a record people read it." },
      { h: "What to do this quarter", p: "Write an AI usage policy, keep a register of the AI tools you use, and make sure anyone using AI understands the basics. That covers the realistic first steps. See our EU AI Act guide for the detail." },
    ],
  },
  {
    slug: "is-chatgpt-safe-for-work",
    title: "Is ChatGPT Safe to Use at Work? What Your Team Should Know",
    date: "2026-06-18",
    description: "Whether ChatGPT is safe for work depends on which version your team uses. The difference between free, Plus, Team and Enterprise, and the data rules that matter.",
    keyword: "is chatgpt safe for work",
    body: [
      { p: "ChatGPT can be safe for work, but the answer depends entirely on which tier your team uses and what they put into it. The gap between a personal free account and ChatGPT Enterprise is the whole ballgame." },
      { h: "Free and Plus: train on your data by default", p: "On consumer ChatGPT (Free and Plus), OpenAI may use your conversations to improve its models unless you turn that off in data controls. So work data pasted into a personal account can flow into model training, the classic shadow-AI exposure." },
      { h: "Team, Enterprise and the API: don't", p: "OpenAI does not train on data from ChatGPT Team, ChatGPT Enterprise or the API by default, and these tiers add SSO, admin controls and retention settings. For business use with any sensitive data, that's the tier you want." },
      { h: "The practical rule", p: "Approve a business tier, tell staff to use it (not personal accounts) for work, and never enter secrets, customer data or confidential plans into any consumer AI tool. Capture that in your AI usage policy so it's a rule, not a hope." },
      { h: "See the full profile", p: "Our AI Tool Risk Directory has ChatGPT's full data-handling profile (training, retention, SOC 2, GDPR DPA and HIPAA status) sourced from OpenAI's own policies, alongside 20+ other tools." },
    ],
  },
];

const WEEK2_POSTS: Post[] = [
  {
    slug: "ai-governance-software-guide",
    title: "Best AI Governance Software for Small Teams",
    date: "2026-06-20",
    description: "Compare the top AI governance tools for teams that need policy management, tool tracking, and staff attestation in one place. Updated for 2026.",
    keyword: "ai governance software",
    body: [
      { p: "AI governance software helps organisations track which AI tools are approved, keep a live policy in one place, and record that staff have acknowledged the rules. For small teams, the right choice is a platform lightweight enough to deploy in a day rather than a six-month enterprise rollout." },
      { h: "What good AI governance software does", p: "At minimum, you need: a policy builder (so you're not starting from scratch), a tool registry (approve Notion AI, flag Otter.io, block consumer ChatGPT), and an attestation trail (proof that Alice in Finance read the policy on 12 June). Everything else is nice to have." },
      { h: "The problem with generic policy tools", p: "Most document-management and HR platforms can store a policy PDF, but they can't auto-generate one based on your company type and data sensitivity, and they have no concept of an 'AI tool risk profile'. You end up with a document that's approved but not actively managed." },
      { h: "What ModelCharter does differently", p: "ModelCharter is built specifically for AI governance: the policy generator tailors output to your regulatory context (EU AI Act, HIPAA, SOC 2), the tool directory flags each app's training and data-retention behaviour, and team attestation is a click rather than a manual email chain. See the tool registry to check your current stack." },
      { h: "Making the choice", p: "If you have fewer than 50 staff, a purpose-built tool like ModelCharter costs far less in setup time than a generic platform. If you're past 200 people, check whether your existing GRC platform has an AI module before buying separately. In either case, the goal is to go from zero policy to active governance in days, not quarters." },
    ],
  },
  {
    slug: "ai-compliance-software-guide",
    title: "AI Compliance Software: What to Look For in 2026",
    date: "2026-06-20",
    description: "AI compliance software should handle policy creation, tool vetting, and audit trails. Here's what actually matters when evaluating your options for 2026.",
    keyword: "ai compliance software",
    body: [
      { p: "The market for AI compliance software grew fast across 2025, and most offerings fall into one of two camps: heavy GRC platforms that added an 'AI module', and purpose-built tools that start with AI governance from the ground up. The right fit depends on your current compliance maturity." },
      { h: "The three pillars of real AI compliance", p: "Any credible AI compliance solution must cover: (1) policy management, generating, storing and versioning your AI usage policy; (2) tool risk assessment, evaluating each AI product for training on data, retention, and regulatory fit; and (3) audit trail, an immutable record of who approved what and when. Tools weak on any pillar leave you with gaps a regulator or customer audit will find." },
      { h: "Watch out for document-management wrappers", p: "Some vendors sell a SharePoint folder and a template as 'AI compliance'. Ask vendors directly: can the tool evaluate whether a specific AI tool is GDPR-compliant? Can it enforce an approval workflow when a new AI app is requested? Can it prove attestation without a manual email?" },
      { h: "EU AI Act and HIPAA considerations", p: "If you have EU operations, the AI literacy duty under the EU AI Act (Article 4, applied February 2025) requires documented training. HIPAA-regulated organisations need a business-associate agreement (BAA) with any AI tool that processes protected health information. Your compliance software should surface these obligations automatically based on your profile." },
      { h: "ModelCharter is built for this", p: "Our policy generator, tool directory and team attestation module cover all three pillars for companies from 5 to 500 people. Start with an AI usage policy in minutes, then work through your tool stack." },
    ],
  },
  {
    slug: "ai-data-privacy-guide",
    title: "AI and Data Privacy: What Every Business Must Know",
    date: "2026-06-20",
    description: "AI tools and data privacy are in direct tension. Here's how the major AI tools handle your data, and what your business needs to do to stay safe and compliant.",
    keyword: "ai data privacy",
    body: [
      { p: "Every AI tool you or your team uses either handles your data safely or it doesn't. The gap between a free consumer plan and a business tier is often the whole privacy story. Getting this wrong means confidential data in a training corpus, GDPR exposure, or a customer audit finding you'd rather not face." },
      { h: "How AI tools use your data", p: "Consumer tiers of tools like ChatGPT, Gemini and Claude may use your conversations to improve their models by default. Business tiers (ChatGPT Team, Claude for Work, Gemini for Google Workspace) typically don't train on your data and offer DPA agreements. The difference is a plan upgrade and a policy that points staff to the right tier." },
      { h: "GDPR and AI", p: "If your organisation handles personal data of EU residents and you pass that data to an AI tool, GDPR applies. You need a Data Processing Agreement (DPA) with the AI vendor, a lawful basis for the processing, and records of that processing activity. Many teams do this without realising it every time customer names or emails touch an AI assistant." },
      { h: "HIPAA and AI", p: "US healthcare teams face a harder line: any AI tool that processes protected health information (PHI) must sign a Business Associate Agreement (BAA). OpenAI, Anthropic and Google all offer BAAs on their enterprise plans, but not their consumer ones. Using a non-BAA tier with any PHI is a HIPAA violation." },
      { h: "Practical first steps", p: "Check which AI tools your team actually uses (not just the ones IT approved). Verify which tier each is on. Require business-tier accounts for anything that touches client data, PII or confidential plans. Document that in your AI usage policy. ModelCharter's tool directory shows the data-handling profile of the most popular tools so you don't have to read every privacy policy yourself." },
    ],
  },
  {
    slug: "ai-risk-assessment-guide",
    title: "How to Run an AI Risk Assessment for Your Business",
    date: "2026-06-20",
    description: "An AI risk assessment identifies which AI tools and uses carry the most risk for your business. A practical framework for teams of any size to complete in under a day.",
    keyword: "ai risk assessment",
    body: [
      { p: "An AI risk assessment doesn't need to be a big project. For most small and mid-sized teams it boils down to four questions: what AI tools do we use, what data do they touch, what are the contractual data protections, and what could go wrong if those protections fail?" },
      { h: "Step 1: Inventory your AI tools", p: "You can't assess what you don't know exists. Start by asking every team what AI tools they use: the ones IT bought, the ones individuals pay for themselves, and the ones built into other software (AI features in your CRM, AI writing in Notion, AI summaries in your video-conferencing tool). Shadow AI is often most of the list." },
      { h: "Step 2: Classify by data sensitivity", p: "For each tool, note what data actually flows into it: public information (low risk), internal plans and IP (medium risk), personal data / PII (high risk under GDPR), protected health information (critical under HIPAA), financial or legal data (often regulated). Higher-sensitivity data demands more scrutiny of the tool's terms." },
      { h: "Step 3: Evaluate the tool's safeguards", p: "For each tool handling sensitive data, check: does it train on your inputs? What are its data-retention periods? Does it offer a DPA or BAA? Is SOC 2 or ISO 27001 in scope? Business tiers usually pass these checks; consumer tiers often don't." },
      { h: "Step 4: Document and act", p: "Record what you found in a tool register (approved / conditionally approved / not approved) and update your AI usage policy to reflect the decisions. Then check staff have read the updated policy. ModelCharter's tool directory and policy generator handle steps 3 and 4 without a spreadsheet." },
    ],
  },
  {
    slug: "ai-acceptable-use-policy",
    title: "AI Acceptable Use Policy: What to Include",
    date: "2026-06-20",
    description: "An AI acceptable use policy (AUP) sets out what employees can and cannot do with AI tools at work. Here's the structure that covers the essentials for most teams.",
    keyword: "ai acceptable use policy",
    body: [
      { p: "An AI acceptable use policy (AUP) is a specific form of AI usage policy focused on what employees may and may not do, rather than the vendor or technical details. It's the document your staff actually reads and signs, so clarity matters more than comprehensiveness." },
      { h: "What to always include", p: "A clear data rule ('never enter confidential, personal or client data into a consumer AI tool'), an approved-tools list (or a link to it), a transparency rule (staff must disclose AI-generated content where material), and a reporting mechanism (where to ask about a new tool, where to flag a concern)." },
      { h: "What varies by sector", p: "Legal, medical and financial services teams often need a stricter data rule that prohibits even aggregate or anonymised client data. Education teams need rules around AI-generated student-facing content. If you're EU-based, an AI literacy acknowledgement clause covers the Article 4 duty under the EU AI Act." },
      { h: "Length and tone", p: "The most-used AI policies are one to two pages. Write it in plain English, not legalese. The goal is a document employees read and remember, not a liability shield. Employees who understand the policy by default follow it; employees who skip it because it's dense don't." },
      { h: "Generate one in minutes", p: "ModelCharter's free AI usage policy generator asks you the key questions (company type, data sensitivity, regulatory context) and outputs a ready-to-share policy. It's faster than any template and already structured for AI literacy attestation." },
    ],
  },
  {
    slug: "chatgpt-for-business-policy",
    title: "ChatGPT for Business: Creating a Clear AI Policy",
    date: "2026-06-20",
    description: "Before rolling out ChatGPT for business use, you need a clear policy: which tier to use, what data is off-limits, and how to hold staff to the rules at work.",
    keyword: "chatgpt for business policy",
    body: [
      { p: "ChatGPT is already used by someone on most teams. Whether that's an asset or a liability depends almost entirely on which tier they're using and whether there's a policy explaining the rules. Getting this right takes a few hours, not a compliance project." },
      { h: "The tier question is the most important one", p: "ChatGPT Free and Plus are consumer products. By default, OpenAI may use inputs to improve its models, and you have no data-processing agreement. ChatGPT Team and ChatGPT Enterprise don't train on your data and come with admin controls and a DPA. For any work involving client data, confidential plans or personal data, the business tier is non-negotiable." },
      { h: "What your policy should say about ChatGPT", p: "Specify which tier is approved (e.g., 'ChatGPT Team accounts only, not personal Free or Plus accounts'), what's off limits (client PII, source code, unreleased product plans, legal or financial data), and whether staff need manager approval before using ChatGPT to produce client-facing content." },
      { h: "Disclosure and attribution", p: "Where ChatGPT produces material that goes to customers, regulators or the public, consider requiring a disclosure or editor review step. Some B2B contracts and regulated sectors prohibit sending AI-drafted content without human review. Make the rule explicit rather than leaving it to judgment." },
      { h: "Enforce it with attestation", p: "A policy nobody signed might as well not exist. ModelCharter's attestation module sends the policy to every team member and tracks who has read and accepted it, so you have a record rather than a hope. Set up a policy in minutes and send it for acknowledgement today." },
    ],
  },
  {
    slug: "generative-ai-policy-guide",
    title: "Generative AI Policy: A Starter Guide for Teams",
    date: "2026-06-20",
    description: "A generative AI policy covers ChatGPT, Claude, Gemini and similar tools. Here's what to include, how strict to be, and a free generator that writes it for you.",
    keyword: "generative ai policy",
    body: [
      { p: "A generative AI policy is a specific form of AI usage policy that addresses how employees may use tools that create or transform content: writing assistants, image generators, code completers and audio/video tools. It's distinct from traditional software policies because the risk profile is different: your inputs train models, your outputs may be wrong, and attribution is unclear." },
      { h: "Scope: which tools need to be covered", p: "Obvious candidates: ChatGPT, Claude, Gemini, Copilot, Midjourney, DALL-E, GitHub Copilot, Grammarly Go. Less obvious: AI features inside Canva, Notion, Slack, Zoom and your CRM. Your policy should either name approved tools or set a principle (e.g., 'tools that use your data for model training are not approved for work use without explicit sign-off')." },
      { h: "The three rules most policies need", p: "1. Data: do not enter confidential, personal or client data into a non-approved generative AI tool. 2. Accuracy: treat AI output as a draft; a human with domain knowledge must review before it's finalised or sent. 3. Transparency: disclose AI involvement where required by law, contract or context (e.g., legal filings, regulatory submissions, client reports)." },
      { h: "How strict should you be?", p: "That depends on your sector and data sensitivity. A marketing agency can be permissive with public-facing creative. A law firm handling client documents needs a stricter rule. Most teams land on 'conditional approval': generative AI is encouraged for productivity, but specific guardrails apply to specific data types and output uses." },
      { h: "Get a policy in minutes", p: "ModelCharter's free policy generator asks about your sector, data types and regulatory context, and outputs a generative AI policy you can edit and send for team attestation. Start here." },
    ],
  },
  {
    slug: "ai-tool-security-checklist",
    title: "AI Tool Security: What to Check Before Approval",
    date: "2026-06-20",
    description: "Every AI tool that touches your company's data is a potential security risk. Here's the checklist your IT or ops team should use before approving any new AI tool.",
    keyword: "ai tool security",
    body: [
      { p: "Approving a new AI tool takes five minutes if you're just clicking 'OK'. Doing it properly takes closer to 30, but it avoids the kind of discovery that shows up in an audit or a breach. Here's what to check before you say yes." },
      { h: "1. Training and data use", p: "Does the tool train on your inputs? Check the terms of service or privacy policy for the specific tier you're evaluating, not the default consumer terms. Most enterprise and business tiers exclude your data from training; most consumer tiers don't (or do so only if you opt out, which most users never do)." },
      { h: "2. Data retention", p: "How long does the vendor keep your conversations or uploaded data? Standard retention periods range from 0 to 90 days on business tiers. Longer retention means more exposure if the vendor is breached." },
      { h: "3. Compliance certifications", p: "SOC 2 Type II is the baseline for B2B SaaS. ISO 27001 is stronger. For EU data, look for a Data Processing Agreement (DPA) and check whether the vendor is on the EU's Standard Contractual Clauses (SCCs) pathway. For health data, a BAA is required before any PHI touches the tool." },
      { h: "4. Access controls", p: "Does the business tier support SSO, role-based permissions and admin controls? If individuals can create accounts outside the business workspace, shadow AI is still a risk even after you 'approved' the tool at the org level." },
      { h: "5. Incident response", p: "What is the vendor's breach notification obligation and timeline? Under GDPR you have 72 hours. A vendor that can't tell you their own notification SLA is a red flag. ModelCharter's tool directory has pre-checked these points for the most common AI tools so you don't have to research each one from scratch." },
    ],
  },
  {
    slug: "ai-policy-for-startups",
    title: "AI Policy for Startups: A No-Jargon Starter Guide",
    date: "2026-06-20",
    description: "Startups move fast, but skipping an AI policy creates hidden risk. A lightweight framework that covers the essentials without slowing down a lean team at any stage.",
    keyword: "ai policy for startups",
    body: [
      { p: "Most startups adopt AI tools fast, write the policy never, and discover the risk when a customer asks a security questionnaire question or a regulator comes knocking. The good news: for a seed or Series A company, a credible AI policy takes less time to write than it takes to argue about whether you need one." },
      { h: "What 'enough' looks like for an early-stage company", p: "A one-page policy that says: which AI tools are approved and at what tier, what data employees must not put into those tools, that any AI-generated content going to customers needs a human review, and who owns AI governance questions. That's it. Save the comprehensive AI risk register for when you're past 50 people." },
      { h: "The real risk at the startup stage", p: "It's shadow AI. Your engineers will use GitHub Copilot (probably fine on the paid tier), your marketing person will run campaigns through Claude (probably fine on the Pro tier), and someone in finance will paste a spreadsheet into the free version of Gemini (potentially not fine). One line in your policy about approved tiers prevents most of that." },
      { h: "When customers ask", p: "B2B customers increasingly include AI governance questions in security reviews and vendor questionnaires. A written policy is your answer. Without one, the honest reply is 'we don't have one', which loses deals with security-conscious buyers." },
      { h: "Generate one now", p: "ModelCharter's free policy generator builds a startup-appropriate AI policy from your answers in about two minutes. After you generate it, send it to your team for acknowledgement so you have a record." },
    ],
  },
  {
    slug: "hipaa-ai-compliance-guide",
    title: "HIPAA AI Compliance: What Healthcare Teams Must Do",
    date: "2026-06-20",
    description: "Using AI tools in a healthcare setting triggers HIPAA requirements. Here's what that means for your AI usage policy, vendor vetting, and compliance documentation.",
    keyword: "hipaa ai compliance",
    body: [
      { p: "HIPAA doesn't mention AI by name, but its rules apply fully to any software that creates, receives, maintains or transmits protected health information (PHI). If an AI tool touches PHI, even indirectly, HIPAA's safeguard and BAA requirements apply." },
      { h: "The BAA requirement", p: "Any AI vendor that processes PHI on behalf of your organisation is a Business Associate. Under HIPAA, you must have a signed Business Associate Agreement (BAA) with them before any PHI flows into their system. Without a BAA, using the tool with PHI is a HIPAA violation regardless of whether a breach occurs." },
      { h: "Which AI tools offer a BAA?", p: "OpenAI (ChatGPT Enterprise), Anthropic (Claude for Enterprise, on request), Google (Vertex AI Gemini, Workspace Enterprise) and Microsoft (Azure OpenAI, Microsoft 365 Copilot E5) all offer BAAs on their enterprise tiers. Consumer and standard business tiers do not cover PHI. Verify the specific product and tier before use." },
      { h: "Your AI usage policy must address PHI explicitly", p: "A generic AI usage policy is not enough for healthcare settings. Your policy should explicitly state: PHI must not enter any AI tool without a signed BAA; approved AI tools for clinical use must be listed by name and tier; any AI-assisted clinical documentation must be reviewed by a licensed clinician before entering the record." },
      { h: "Documenting compliance", p: "HIPAA enforcement looks at whether you made a good-faith effort to comply. That means written policies, staff training records, BAAs on file and a process for evaluating new AI tools before deployment. ModelCharter's AI usage policy generator has a HIPAA-aware mode that adds the right clauses automatically." },
    ],
  },
  {
    slug: "gdpr-ai-tools-guide",
    title: "GDPR and AI Tools: What EU Teams Must Know",
    date: "2026-06-20",
    description: "AI tools that process personal data of EU residents must comply with GDPR. A practical checklist for teams already managing GDPR who are now adding AI to the mix.",
    keyword: "gdpr ai tools",
    body: [
      { p: "GDPR and AI tools interact in at least three ways: your prompts may include personal data, the AI vendor processes that data on your behalf, and AI-generated output about individuals carries its own obligations. Teams already managing GDPR need to extend their compliance to cover these new flows." },
      { h: "Data Processing Agreements (DPAs)", p: "If you pass personal data to an AI tool (even in a prompt), the AI vendor is processing data on your behalf and must sign a DPA. Major AI vendors offer DPAs on business tiers: OpenAI, Anthropic, Google and Microsoft all have them. Consumer tiers typically don't include a DPA, which is why they're unsuitable for work involving EU personal data." },
      { h: "Lawful basis for AI processing", p: "Processing personal data through AI tools needs a lawful basis under GDPR Article 6. Legitimate interests is the most common basis for internal uses (productivity, analysis). Consent is impractical at scale. Whatever basis you use, document it in your Records of Processing Activities (RoPA)." },
      { h: "Data subject rights", p: "If personal data enters an AI tool that retains conversations, a data subject access request (DSAR) or erasure request could require you to retrieve or delete that data from the AI vendor's systems. Check your vendor's data retention policy and whether their enterprise tier supports deletion on request." },
      { h: "The EU AI Act layer", p: "The EU AI Act adds AI-literacy obligations on top of GDPR. Since February 2025, organisations must ensure staff using AI tools have a sufficient level of AI literacy and must be transparent when AI generates content shown to users. Your AI usage policy should address both. ModelCharter's policy generator covers GDPR and EU AI Act requirements together." },
    ],
  },
  {
    slug: "employee-ai-training-requirements",
    title: "Employee AI Training: Meeting the EU AI Act's Duty",
    date: "2026-06-20",
    description: "The EU AI Act requires AI literacy for all staff using AI tools. Here's what that obligation means in practice and how to document it without a full training program.",
    keyword: "employee ai training requirements",
    body: [
      { p: "The EU AI Act's AI-literacy obligation (Article 4) came into force in February 2025. It requires organisations to ensure that staff who use AI tools have a 'sufficient level of AI literacy', enough to understand what AI does, what its limits are, and when to apply human judgment." },
      { h: "What 'sufficient' means in practice", p: "There's no prescribed curriculum. The standard the regulators are aiming at is: employees should understand that AI output can be wrong and must be reviewed, that certain data should not be shared with AI tools, and that there are rules for disclosing AI-generated content. A short written briefing plus a policy acknowledgement covers the intent of the law for most employees." },
      { h: "How to document it", p: "You need a record of who received the literacy training and when. The simplest form: send your AI usage policy (which includes the key literacy points) to every relevant employee and track acknowledgement. That gives you a timestamped, signed record for each person. ModelCharter's attestation module does this automatically." },
      { h: "Who is 'relevant staff'?", p: "Article 4 covers all natural persons deploying AI systems within your organisation. In practice: anyone who uses an AI tool as part of their role. That is now almost everyone. Err on the side of including rather than excluding." },
      { h: "Annual refresh is best practice", p: "AI tools and regulations change. An annual re-attestation cycle ensures your records stay current and that staff who joined after the initial rollout are covered. Set a calendar reminder or use ModelCharter's attestation re-send feature to close the gap." },
    ],
  },
  {
    slug: "ai-governance-framework-guide",
    title: "AI Governance Framework: Build One That Lasts",
    date: "2026-06-20",
    description: "An AI governance framework gives your organisation a repeatable way to approve AI tools, manage policy, and stay compliant as the landscape shifts. Here's how to build one.",
    keyword: "ai governance framework",
    body: [
      { p: "An AI governance framework is the structured approach your organisation uses to make decisions about AI: which tools to approve, what rules apply to their use, who is accountable, and how compliance is demonstrated. It's the difference between ad hoc AI adoption and AI adoption you can defend to a customer, regulator or board." },
      { h: "The four components of a working framework", p: "1. Policy: your AI usage policy, version-controlled and distributed. 2. Registry: a live list of approved AI tools with their risk rating and approved use cases. 3. Process: how new AI tools are requested, evaluated and approved or rejected. 4. Attestation: proof that staff have acknowledged the policy, refreshed at least annually." },
      { h: "Governance without bureaucracy", p: "For companies under 100 people, the entire framework can live in a single document and a simple tool. Over-engineering it (multiple committees, quarterly policy reviews, 40-page risk matrices) guarantees the framework is ignored in favour of just getting work done. Keep it lightweight and sustainable." },
      { h: "Who owns it?", p: "Name a single owner: typically the COO, Head of IT, or a designated Privacy/Compliance Lead. Without a named owner, the framework becomes everyone's problem and no one's responsibility. The owner approves new tools, updates the policy and handles employee questions." },
      { h: "ModelCharter as your framework backbone", p: "Rather than building the four components from scratch, ModelCharter gives you a policy generator (component 1), an AI tool directory (component 2), an approval workflow for new tools (component 3), and attestation tracking (component 4). Operational in a day, not a quarter." },
    ],
  },
];

POSTS.push(...WEEK2_POSTS);

const WEEK3_POSTS: Post[] = [
  {
    slug: "iso-42001-guide",
    title: "ISO 42001 Explained: The AI Management System Standard",
    date: "2026-06-21",
    description: "ISO 42001 is the international standard for AI management systems. Here's what it covers, who needs it, and how to use it as a governance blueprint.",
    keyword: "iso 42001",
    body: [
      { p: "ISO/IEC 42001 is the first international standard specifically for AI management systems. Published in 2023, it gives organisations a structured way to govern AI: setting objectives, managing risk, and demonstrating responsible use. Unlike ISO 27001 (which covers information security broadly), 42001 is built around the particular characteristics of AI, things like data quality, model transparency, and the shifting regulatory landscape." },
      { h: "Deployer or provider: which duties apply to you?", p: "ISO 42001 distinguishes between AI providers (organisations that develop or supply AI systems) and AI deployers (organisations that use AI systems built by others). Most small and mid-sized businesses are deployers. That's significant: deployer duties are less intensive than provider duties. You're not being asked to document how a model was trained; you're being asked to have a policy for how you use it safely." },
      { h: "The four things the standard requires from deployers", p: "A documented AI policy aligned to your risk context; a register of AI systems in use (what they do, who uses them, what data they process); controls for the risks those systems create; and records that demonstrate your governance is active, not just on paper. These map directly to ModelCharter's three artefacts: a generated usage policy, an AI tool directory, and an attestation trail." },
      { h: "ISO 42001 versus the EU AI Act", p: "The two are complementary, not competing. The EU AI Act is law: it sets mandatory obligations with enforcement teeth. ISO 42001 is a voluntary standard that provides a management system framework for meeting those obligations. Many organisations pursuing EU AI Act compliance find that implementing ISO 42001 structures their approach and produces the documented evidence regulators want to see. If you're working towards one, you're already partly working towards the other." },
      { h: "Where to start without a dedicated team", p: "You don't need a compliance function to begin. Start with three core artefacts: an AI usage policy (which documents your stance and controls), a register of approved tools (which gives you visibility and risk ratings), and staff attestation records (which prove your governance is active). ModelCharter handles all three. Once those are in place, the gap to full ISO 42001 alignment is smaller than you'd think." },
    ],
  },
  {
    slug: "responsible-ai-guide",
    title: "Responsible AI: What It Actually Means for Your Business",
    date: "2026-06-21",
    description: "Responsible AI isn't just a tech-company talking point. Here's what it means in practice for SMBs: the principles, the documentation, and the decisions that make it real.",
    keyword: "responsible ai",
    body: [
      { p: "Responsible AI means using AI in ways that are safe, fair, transparent, and accountable. It sounds abstract, but the practical version for most small businesses is simpler: make deliberate decisions about which AI tools to use, set clear rules for how staff use them, and keep a record that those decisions were made. You don't need an AI ethics committee to operate responsibly." },
      { h: "The five principles most frameworks agree on", p: "Across the NIST AI RMF, ISO 42001, the EU AI Act and most corporate AI ethics frameworks, five ideas keep surfacing: fairness (AI decisions should not discriminate unlawfully), transparency (users should know when they are interacting with AI), accountability (someone is responsible for AI use), safety (AI outputs should not cause harm), and privacy (personal data is handled lawfully). Not all five apply to every use case, but they make a useful starting checklist." },
      { h: "What responsible AI looks like for an SMB", p: "In practice: you have an AI usage policy that states which tools are approved and what data is off-limits. Staff understand those rules and have acknowledged reading them. You have checked that your AI vendors handle data in line with GDPR or HIPAA as appropriate. When AI output goes to customers, a human reviews it. That is a responsible AI programme for a 20-person company. It fits on two pages." },
      { h: "Human review is the most important control", p: "AI tools produce confident-sounding output that can be wrong, biased, or misleading without flagging it as such. The single most reliable safeguard is not a technical one: it is requiring a human with domain knowledge to review AI output before it influences an important decision or reaches an external party. This applies to client reports, legal documents, financial analysis, marketing copy, and customer service responses. State that requirement explicitly in your AI policy." },
      { h: "Document your approach", p: "Responsible AI without documentation is just a good intention. Regulators, customers, and auditors want evidence. A written policy, a register of approved tools, and a record of staff acknowledgement gives you that evidence. ModelCharter generates the policy and runs the attestation process. Your AI governance then becomes something you can point to, not just something you claim." },
    ],
  },
  {
    slug: "what-is-ai-compliance",
    title: "AI Compliance: What It Is and What Your Business Must Do",
    date: "2026-06-22",
    description: "AI compliance means meeting your legal obligations around AI use. Here's what those obligations actually are for a small business in 2026, and how to address them.",
    keyword: "ai compliance",
    body: [
      { p: "AI compliance is the process of ensuring your organisation uses AI in line with applicable laws, regulations, and contractual commitments. For most small and mid-sized businesses, the relevant obligations cluster around four frameworks: the EU AI Act, GDPR, HIPAA (for US healthcare teams), and SOC 2 (for B2B software companies). You are probably not subject to all four, but you are likely subject to at least one." },
      { h: "EU AI Act: the deployer's obligations", p: "If your organisation uses AI tools and any part of your operation reaches the EU, the EU AI Act applies, even if you are based outside the EU. For deployers of general-purpose AI tools, which is most SMBs, the practical duties are: ensure staff using AI have basic AI literacy, maintain transparency when AI interacts with end users, and avoid prohibited practices (such as social scoring or real-time biometric surveillance in public spaces). The AI literacy duty has applied since February 2025." },
      { h: "GDPR: the data processing layer", p: "Any AI tool that processes personal data of EU residents is a data processor on your behalf. You need a Data Processing Agreement with the vendor, a lawful basis for the processing, and records of that processing in your Register of Processing Activities. Consumer AI tiers often do not come with DPAs, which is why they are unsuitable for work involving EU personal data regardless of any other factors." },
      { h: "HIPAA: the healthcare boundary", p: "US healthcare organisations and their business associates must ensure any AI tool handling protected health information has a signed Business Associate Agreement before use. Without one, using the tool with PHI is a violation, the incident does not need to occur for the obligation to apply. Check the tier: enterprise plans usually include BAAs; consumer and standard business plans usually do not." },
      { h: "SOC 2: the B2B evidence question", p: "SOC 2 does not create AI-specific legal obligations, but enterprise customers conducting vendor due diligence increasingly expect you to have an AI governance policy as part of your security posture. A written AI usage policy, a record of approved tools, and attestation records are the artefacts that satisfy most SOC 2 AI-related audit questions. Getting those in place prepares you for customer scrutiny as well as regulatory scrutiny." },
      { h: "Start with a policy", p: "AI compliance does not start with a legal team; it starts with a policy. ModelCharter's free policy generator produces a compliance-oriented AI usage policy tailored to your regulatory context in minutes. From there, add a tool register and attestation records. Together they cover the documentation trail that most regulators and auditors want to see." },
    ],
  },
  {
    slug: "nist-ai-risk-management-framework",
    title: "The NIST AI Risk Management Framework: A Plain-English Guide",
    date: "2026-06-22",
    description: "The NIST AI Risk Management Framework gives organisations a structured approach to AI risk. What its four functions mean in practice for a non-technical team.",
    keyword: "nist ai risk management framework",
    body: [
      { p: "The NIST AI Risk Management Framework, published by the US National Institute of Standards and Technology in January 2023, is a voluntary framework that helps organisations identify, assess, and manage risks arising from AI systems. Unlike the EU AI Act, it carries no legal force, but it has become the reference standard that US federal agencies, regulated industries, and enterprise procurement teams point to when they ask 'how do you manage AI risk?'" },
      { h: "The four core functions: GOVERN, MAP, MEASURE, MANAGE", p: "The NIST AI RMF organises AI risk management into four functions. GOVERN sets the culture and accountability structures: who owns AI risk, what policies exist, how decisions are made. MAP identifies which AI systems you use and what risks they create. MEASURE evaluates those risks using qualitative or quantitative methods. MANAGE puts controls in place and monitors their effectiveness over time. For most SMBs, the GOVERN and MAP functions are the most immediately actionable starting point." },
      { h: "GOVERN in practice for a small team", p: "Governance at SMB scale means naming a single owner for AI decisions, writing down your AI usage policy, and making sure staff know the rules. You do not need a risk committee or a quarterly review cycle. A one-page policy with a named owner and annual review is a credible implementation of GOVERN for a team of under 50 people. The goal is documented accountability, not administrative complexity." },
      { h: "MAP: knowing what you are actually using", p: "You cannot manage AI risk you do not know about. MAP starts with an inventory: what AI tools does your organisation use, who uses them, and what data flows into them? This is the AI tool register that also satisfies ISO 42001 and EU AI Act documentation requirements. Once you have the inventory, you can classify each tool by risk level and apply appropriate controls. Shadow AI, tools your team uses without IT's knowledge, is usually the biggest gap in any MAP exercise." },
      { h: "How NIST AI RMF relates to EU AI Act and ISO 42001", p: "The three frameworks are designed to complement each other. The EU AI Act sets legal minimums. ISO 42001 provides a management system for meeting and demonstrating them. NIST AI RMF offers a risk-management lens, particularly useful for US organisations or those with international operations. Many compliance professionals map controls across all three, since the overlapping requirements mean satisfying one framework does much of the work for the others." },
      { h: "Getting started without a risk team", p: "Pick up GOVERN and MAP first. Publish an AI usage policy, name an owner, build a register of approved tools. ModelCharter handles all of that. From there, MEASURE and MANAGE add depth as your AI use grows, but you do not need them on day one. Governance that exists beats a perfect framework that is still being designed." },
    ],
  },
  {
    slug: "copilot-data-privacy-guide",
    title: "Microsoft Copilot and Data Privacy: What Teams Need to Know",
    date: "2026-06-23",
    description: "Microsoft Copilot's data handling depends on which tier you use. What M365 Copilot actually does with your data, and how to explain it to your team.",
    keyword: "copilot data privacy",
    body: [
      { p: "Microsoft Copilot is now built into Word, Excel, Teams, Outlook, and dozens of other Microsoft 365 apps. That is useful, but it also means your organisation's data is flowing into an AI system at a scale most teams have not stopped to consider. Understanding how Copilot handles that data is now a basic IT and compliance task, not an advanced one." },
      { h: "Which Copilot are you talking about?", p: "Microsoft has multiple Copilot products, and the data-handling terms differ significantly between them. Microsoft 365 Copilot, available to business users on E3 or E5 licences, or via the Copilot add-on, is the enterprise product with the strongest data protections. Copilot in Windows, Bing Copilot, and the free consumer Copilot are separate products with different, weaker terms. When writing your AI policy, specify which product is approved and which is not." },
      { h: "What Microsoft 365 Copilot does with your data", p: "Microsoft 365 Copilot does not train its foundational models on your organisation's data. Your content stays within your Microsoft 365 tenant boundary. Microsoft confirms that prompts and responses are not used to improve third-party or foundational models, and your data is subject to your existing Microsoft data-processing terms and GDPR Data Processing Agreement. The European Data Boundary commitment also applies for EU-based organisations." },
      { h: "What the consumer Copilot experience does", p: "If your team members use Copilot via personal Microsoft accounts or Bing.com, they are on consumer terms. Those terms allow Microsoft to use conversational data for service improvement unless users opt out, and most users never do. This is the same business-versus-consumer distinction that applies to ChatGPT and Gemini. Your AI policy should close this gap explicitly by naming which product and account type is approved for work use." },
      { h: "What to include in your AI policy", p: "Specify that only Microsoft 365 Copilot on your business tenant is approved for work involving company data, client information, or personal data. Personal Microsoft accounts using Copilot are not approved for these uses. Record the GDPR DPA confirmation, Microsoft provides this as part of M365 licensing, in your data processing register. A clear internal distinction between the enterprise product and the consumer experience prevents the most common compliance gap for Microsoft-heavy organisations." },
    ],
  },
  {
    slug: "ai-governance-tools-guide",
    title: "AI Governance Tools: What to Look For and How to Choose",
    date: "2026-06-23",
    description: "AI governance tools manage your policy, tool register, and attestation in one place. Here's what features actually matter when evaluating your options in 2026.",
    keyword: "ai governance tools",
    body: [
      { p: "AI governance tools are software platforms that help organisations manage their AI usage policy, track approved and unapproved AI tools, and record staff acknowledgements. The category grew quickly across 2025 as enterprises started including AI governance in security reviews and SMBs began realising that a PDF policy in a shared drive was not going to satisfy a customer audit or a regulatory enquiry." },
      { h: "The three things an AI governance tool must do", p: "Policy management: generating, version-controlling, and distributing your AI usage policy. Tool registry: maintaining an up-to-date list of approved AI tools with their risk ratings, data-handling profiles, and approved use cases. Attestation: sending the policy to every relevant team member, tracking who has acknowledged it, and storing a timestamped record. Tools that do not cover all three leave you with gaps. Ask about each before you commit." },
      { h: "What to ignore in vendor demos", p: "Most vendors will show you dashboards, integrations, and analytics features first. These are fine to have but they do not solve your core problem. Ask instead: can this tool generate a policy tailored to our regulatory context, EU AI Act, HIPAA, SOC 2? Can it evaluate a specific AI tool against our data sensitivity requirements? Can it prove attestation without a manual email chain? Yes to all three means the rest is detail." },
      { h: "Team size changes the right answer", p: "For teams under 50 people, the right AI governance tool is lightweight and fast to deploy, ideally a purpose-built platform you can have live in a day. For teams of 200 or more, check whether your existing GRC, HR, or IT service-management platform has added an AI governance module, since you may already have it. The mistake to avoid is buying an enterprise GRC platform when a focused tool does the job in a tenth of the setup time." },
      { h: "Why the tool directory matters more than it looks", p: "One undervalued feature is a pre-built AI tool risk directory. Vetting each AI tool your team wants to use from first principles, reading every vendor privacy policy, checking DPA and BAA availability, confirming SOC 2 status, takes hours per tool. A governance platform that has already done this for the 30 most popular AI applications saves weeks of work and keeps up with changes as vendors update their terms. ModelCharter's tool directory is updated from vendors' own published policies." },
    ],
  },
  {
    slug: "soc-2-ai-guide",
    title: "SOC 2 and AI Tools: What Auditors Are Now Asking",
    date: "2026-06-24",
    description: "SOC 2 auditors are increasingly scrutinising AI tool use. Here's what they're looking for and how to make sure your AI governance holds up in an audit.",
    keyword: "soc 2 ai",
    body: [
      { p: "SOC 2 was designed for cloud software companies, but its Trust Services Criteria apply to AI tools too. As AI adoption has accelerated, auditors have started asking questions the original SOC 2 criteria did not anticipate: do you know which AI tools your team uses? Do you have a policy for them? Have you vetted AI vendors the same way you vet any other third-party processor? For most small SaaS companies, AI is now inside the scope of an audit whether you planned for it or not." },
      { h: "The AI questions appearing in SOC 2 engagements", p: "Current auditors are asking variants of: what AI tools are in use in your environment? Do you have an AI usage policy? Have employees been trained on it? How do you evaluate AI tools before approval, especially those that process customer data? Do your AI vendors have their own SOC 2 reports? Is there a process for retiring AI tools that no longer meet your standards? None of these questions have a satisfying answer if you have not documented your AI governance before the audit starts." },
      { h: "Vendor management controls and AI", p: "SOC 2's vendor management requirements apply to AI vendors. If an AI tool processes data that is in scope for your SOC 2 engagement, you need to have evaluated that vendor, confirming their SOC 2 status, their data-handling terms, and (for personal data) a Data Processing Agreement. Keep records of those evaluations as you would for any other vendor. Your AI tool register doubles as the vendor management documentation that satisfies this criterion." },
      { h: "AI policy as SOC 2 evidence", p: "The Common Criteria around logical access and change management both touch on AI indirectly. An AI usage policy that specifies who is authorised to use which tools, what data is permitted, and who approves new tools maps onto the access control and change management criteria auditors already check. Writing your AI policy with those criteria in mind means it does double duty: governance document and audit evidence at the same time." },
      { h: "The fastest path to audit-readiness", p: "Get your policy in writing, get your tool list documented with vendor SOC 2 status noted, and get staff to acknowledge the policy. Those three steps produce the documentation that satisfies most AI-related audit questions without custom controls or lengthy projects. ModelCharter generates the policy and attestation trail. Checking vendor SOC 2 status takes around ten minutes per tool in our tool directory, far less than a full vendor questionnaire from scratch." },
    ],
  },
  {
    slug: "ai-vendor-risk-assessment",
    title: "AI Vendor Risk Assessment: A Practical Checklist",
    date: "2026-06-24",
    description: "An AI vendor risk assessment checks whether a tool is safe to use with your company's data. Seven questions to ask before approving any AI vendor.",
    keyword: "ai vendor risk assessment",
    body: [
      { p: "Most vendor risk assessments were built before AI tools existed, and they miss the specific risks AI creates: training on your data, generating errors treated as facts, or processing regulated data without the right contractual cover. A good AI vendor risk assessment adds AI-specific questions to your standard vendor management checks. Here is what those questions are, and why they matter." },
      { h: "Does it train on your data?", p: "This is the first question for any AI tool. Consumer tiers of most major AI products train on your inputs by default unless you opt out, and most users never do. Business and enterprise tiers typically do not. Check the specific tier you are evaluating, not the default consumer terms. Ask the vendor directly: for this plan, is our data used to train or improve your models? Get the answer confirmed in the plan documentation before approval." },
      { h: "What are the data retention periods?", p: "Even if a vendor does not train on your data, they may retain it for 30, 60, or 90 days for safety, audit, or operational reasons. Understand those periods before you approve sensitive use cases. For highly sensitive data, shorter retention is better. Some enterprise tiers offer zero retention, prompts and responses are not stored after the session ends. Worth asking about if your team regularly handles sensitive material." },
      { h: "Do they have a DPA or BAA?", p: "If any personal data flows into the tool, you need a Data Processing Agreement with the vendor as a GDPR requirement. If any protected health information flows into it, you need a Business Associate Agreement as a HIPAA requirement. Check the tier: most enterprise plans include these agreements; most consumer and standard business plans do not. Absence of a DPA or BAA is a hard blocker for regulated data, not a risk to manage, a condition to meet before approval." },
      { h: "What are their certifications and can you verify them?", p: "SOC 2 Type II is the minimum baseline for a business AI tool. ISO 27001 is stronger. For EU operations, check the vendor's GDPR compliance documentation and Standard Contractual Clauses status. For healthcare, confirm HIPAA eligibility. Ask for the most recent SOC 2 report, the abstract is usually publicly available, rather than just taking the vendor's word for it. Certifications do not guarantee safety, but their absence is a meaningful risk indicator." },
      { h: "Are there proper access controls?", p: "Can the tool be scoped to your organisation only? Does it support SSO, so individual employee accounts are tied to your identity provider and can be revoked centrally? Does it have role-based permissions so you can limit who in your organisation can use it for what? A tool with robust access controls limits your exposure if an employee account is compromised or an employee leaves. ModelCharter's tool directory includes access control details for the most common AI tools so you are not researching each from scratch." },
    ],
  },
  {
    slug: "chatgpt-for-work",
    title: "ChatGPT at Work: How to Use It Safely and Set Clear Team Rules",
    date: "2026-06-24",
    description: "ChatGPT is on most teams already. Whether it's an asset or a liability depends on the tier your team uses and the rules you set. A practical guide for managers.",
    keyword: "chatgpt workplace",
    body: [
      { p: "ChatGPT at work is now a fact rather than a decision. Someone on your team is using it today, whether IT approved it or not. The question is whether that use is safe, sanctioned, and productive, or whether it is a source of data leakage and a liability when a customer asks who is handling their data. A short, clear policy is the difference between those two outcomes." },
      { h: "The tier problem: not all ChatGPT is equal", p: "There are four distinct ChatGPT tiers for business use purposes. Free accounts and Plus subscriptions are consumer products: by default, OpenAI may use your conversations to improve its models. ChatGPT Team is the first tier that excludes your data from training and provides an admin console. ChatGPT Enterprise goes further with SSO, longer context windows, and negotiable data-retention terms. For any work involving client data, sensitive internal information, or personal data, ChatGPT Team is the minimum safe tier." },
      { h: "Three rules that cover most teams", p: "Keep the rules short. Three lines cover the main risks: use the company ChatGPT Team workspace, not personal accounts. Do not enter client data, financial data, confidential plans, or personal data into ChatGPT. Review any AI-generated content before it goes to a client or externally. Write those rules in your AI usage policy, get everyone to acknowledge them, and you have handled the principal risks without a lengthy governance project." },
      { h: "What to do about personal accounts", p: "Some staff will have personal ChatGPT accounts they have been using for months. Your policy does not need to ban personal AI use in general, but it should be explicit that personal accounts must not be used for company work. If individuals want to use ChatGPT for work, the company account is the approved path. This prevents data from crossing between personal and corporate environments, which is where most AI data-leakage incidents start." },
      { h: "Getting leadership buy-in", p: "The most common blocker to good AI governance is not the staff; it is senior managers who think a policy is either unnecessary (because they trust the team) or counterproductive (because they do not want to slow anyone down). The useful framing: an AI policy protects the business from the risks of unmanaged AI use, data breaches, GDPR violations, SOC 2 audit findings. The cost of setting one up is a morning. ModelCharter's policy generator gets you from blank page to signed policy in under an hour." },
    ],
  },
  {
    slug: "what-is-ai-attestation",
    title: "What Is AI Attestation and Why Does Your Team Need It?",
    date: "2026-06-25",
    description: "AI attestation is a record that each employee has read and accepted your AI policy. Here's why it matters for compliance and how to automate it without a manual process.",
    keyword: "ai attestation",
    body: [
      { p: "AI attestation is the process of confirming that every relevant member of your team has read, understood, and accepted your AI usage policy. It is the bridge between having a policy and being able to prove it. Regulators, auditors, and enterprise customers are increasingly asking not just 'do you have an AI policy?' but 'can you show that your staff have read it?' Attestation is the answer to that second question." },
      { h: "Why attestation matters for the EU AI Act", p: "The EU AI Act's AI literacy obligation under Article 4, in force since February 2025, requires organisations to ensure staff have a sufficient level of AI literacy. A policy distributed and acknowledged through attestation is the most direct way to evidence that duty. Without attestation records, you have a policy document but no proof anyone read it, which is thin evidence for a regulator asking about literacy assurance." },
      { h: "Why attestation matters for SOC 2 and customer audits", p: "SOC 2 auditors and enterprise security questionnaires ask whether your AI policy has been communicated to staff. 'Yes, we emailed it' is a weak answer if you cannot show who received it and when. A timestamped attestation record for each employee, with a date and the version of the policy they accepted, is the audit-grade evidence that satisfies those questions without follow-up." },
      { h: "What a good attestation process looks like", p: "Send the policy to every relevant employee. Track who has opened, read, and accepted it. Store a record with each employee's name, the date, and the policy version. Follow up on anyone who has not acknowledged within a reasonable window. Set a refresh cadence, at least annually, and whenever the policy is materially updated. When someone new joins, they should go through attestation before they start using AI tools for work." },
      { h: "Doing it without a manual process", p: "Sending a PDF by email and tracking responses in a spreadsheet works for five people. It does not scale, and it does not produce reliable evidence. ModelCharter's attestation module sends the policy to your team, tracks who has acknowledged it in real time, and stores the record for audit purposes. When someone new joins or the policy is updated, re-attestation takes a single click from the admin view." },
    ],
  },
  {
    slug: "code-of-conduct-for-ai",
    title: "How to Write a Code of Conduct for AI Use at Work",
    date: "2026-06-25",
    description: "A code of conduct for AI sets out the values behind your rules, not just the rules themselves. Here's how it differs from an AI policy and what to include.",
    keyword: "code of conduct for ai",
    body: [
      { p: "An AI usage policy tells your team what they can and cannot do with AI tools. A code of conduct for AI goes one layer deeper: it articulates the values and principles your organisation applies when using AI, not just the rules. It answers 'why' rather than just 'what'. For leadership communications, ethics frameworks, and external stakeholder commitments, the code-of-conduct format often resonates better than a rulebook." },
      { h: "How it differs from an AI usage policy", p: "An AI usage policy is operational: it specifies approved tools, data handling rules, and reporting mechanisms. A code of conduct for AI is principled: it sets out your organisation's stance on fairness, transparency, human oversight, and the responsible use of AI. In practice, most organisations benefit from both, a policy for staff to follow day to day, and a code of conduct that gives those rules a coherent rationale that people can remember." },
      { h: "Five principles worth including", p: "Human oversight: AI outputs require human review before use in important decisions or external communications. Transparency: be open about AI involvement in your work where it is material. Fairness: monitor AI use for discriminatory patterns, especially in hiring, customer decisions, or content creation. Privacy: only process data through AI tools with appropriate contractual and technical safeguards. Accountability: one named person is responsible for how AI is used across the organisation." },
      { h: "Tone and audience", p: "A code of conduct for AI is often shared more widely than a usage policy, with customers, partners, investors, or prospective hires. The tone should be aspirational and values-led, not legalistic. Write it in the first person plural ('we believe', 'we commit to') and keep it to one page or under. It should read as a genuine commitment, not a liability disclaimer drafted by someone who has never used an AI tool." },
      { h: "Making it real rather than decorative", p: "The risk with any principles document is that it becomes a poster nobody reads. Tie your code of conduct to the actual rules in your AI usage policy by cross-linking the two documents directly. Include it in onboarding materials. Reference it when making AI-related decisions as a team. A code of conduct that shapes actual behaviour is worth writing; one that sits in a drawer is not. ModelCharter's policy generator produces both a detailed usage policy and a values-level summary that functions as a code of conduct." },
    ],
  },
  {
    slug: "ai-risk-management-guide",
    title: "AI Risk Management: A Practical Framework for Non-Technical Teams",
    date: "2026-06-26",
    description: "AI risk management doesn't require a risk team or a technical background. A clear four-step approach for any ops, HR, or IT lead to put in place this quarter.",
    keyword: "ai risk management",
    body: [
      { p: "AI risk management is the process of identifying, evaluating, and reducing the risks that arise from using AI tools in your organisation. The risks are real: data leakage into model training, AI-generated errors treated as facts, regulatory exposure from tools that do not meet GDPR or HIPAA requirements, and reputational harm from undisclosed AI use. Managing these risks does not require a risk management background or a technical team." },
      { h: "Risk 1: shadow AI and unmanaged tools", p: "The highest-probability risk for most SMBs is staff using AI tools the organisation has not evaluated or approved. Shadow AI means data flowing into systems you know nothing about. The control is straightforward: maintain a list of approved AI tools and make it easy to request additions. Awareness of the approved list is the policy; attestation is the evidence that staff have read and understood it." },
      { h: "Risk 2: data classification failures", p: "Not all data carries the same risk if it is exposed. Public information is low risk. Internal plans and intellectual property are medium risk. Personal data, names, email addresses, health records, is high risk under GDPR or HIPAA. The control is a data-sensitivity rule in your AI policy: do not put personal data or confidential information into an AI tool that does not have the right contractual protections. That single rule prevents most high-severity incidents." },
      { h: "Risk 3: over-reliance on AI output", p: "AI systems produce confident-sounding output that can be wrong. The risk in business contexts is that staff treat AI output as authoritative without verification, particularly in legal, financial, medical, or regulatory matters. The control is a human-review requirement in your policy for any AI output that influences an important decision or goes to an external party. State it explicitly; do not leave it to individual judgment." },
      { h: "Risk 4: regulatory exposure without an incident", p: "If your organisation uses AI tools that process EU personal data without a Data Processing Agreement, or processes protected health information without a Business Associate Agreement, you are in regulatory violation regardless of whether a breach occurs. This is a documentation risk that costs nothing to fix: require DPAs and BAAs in your vendor vetting process and check compliance before approving a tool. ModelCharter's tool directory shows which tools offer these agreements on which tiers." },
      { h: "Turning the risks into a register", p: "Record these risks and their controls in a simple register: each AI tool, its risk category, the controls in place, and the date last reviewed. That register is the heart of an AI risk management programme. Combined with a written policy and attestation records, it covers the documentation expectations of the EU AI Act, ISO 42001, NIST AI RMF, and SOC 2, all of which ask for evidence of active risk management rather than just a stated intention." },
    ],
  },
  {
    slug: "best-ai-tools-for-business",
    title: "Best AI Tools for Business in 2026: What to Approve and Why",
    date: "2026-06-26",
    description: "The best AI tools for business depend on your use case and data type. How to evaluate ChatGPT, Claude, Copilot, and Gemini for safe business use.",
    keyword: "best ai tools for business",
    body: [
      { p: "Choosing the best AI tool for business is not really a features question, it is a safety and fit question. A tool that is excellent for personal productivity can be entirely wrong for work if it trains on your data, lacks a DPA, or has no admin controls. Before you recommend any AI tool to your team, these are the criteria that determine whether it belongs on your approved list." },
      { h: "ChatGPT: conditional approval", p: "ChatGPT Team or Enterprise is appropriate for most business uses: it does not train on your data, provides an admin console, and includes a Data Processing Agreement for GDPR compliance. ChatGPT Free and Plus are not appropriate for work involving client data or confidential information. The tier decision is the entire risk conversation for ChatGPT. Ensure everyone on your team is using the company workspace, not a personal account." },
      { h: "Claude (Anthropic): conditional approval", p: "Claude for Work, Anthropic's business plan, excludes your data from model training and supports team admin controls. The consumer Claude.ai free plan does not offer a DPA. Claude Pro (individual subscription) falls between the two: no training on your data by default, but no organisational admin or DPA. For businesses requiring GDPR compliance or audit trails, Claude for Work is the right tier. Healthcare organisations should confirm BAA availability before any use involving protected health information." },
      { h: "Microsoft 365 Copilot: generally approvable", p: "If your organisation already uses Microsoft 365 Business or Enterprise, M365 Copilot is the AI tool with the most natural fit: it runs within your existing tenant, does not train foundational models on your data, and is covered by your existing Microsoft Data Processing Agreement. The main qualifier: ensure staff understand they are using the enterprise Copilot within the business account, not the consumer Bing Copilot, which operates under different terms." },
      { h: "Google Gemini for Workspace: generally approvable", p: "Gemini for Google Workspace on Business and Enterprise plans does not use your data to train Google's AI models and is covered by Google's GDPR DPA. Like Microsoft's offering, it is the sensible first choice for organisations already in the Google ecosystem. Free personal Google accounts using Gemini are a different product with weaker protections, make sure work-related use happens in the business account, not a personal one." },
      { h: "Where to draw the line", p: "The common thread across all these approvals is the business tier versus consumer tier distinction. For any AI tool your team wants to use: confirm the specific tier excludes your data from training, verify a DPA or BAA is available, and check that admin controls exist. Anything that fails those checks goes on the unapproved list. ModelCharter's tool directory has done this evaluation for the most popular AI tools so you are not starting from scratch each time a request comes in." },
    ],
  },
  {
    slug: "ai-policy-for-employees",
    title: "AI Policy for Employees: Rules That People Actually Follow",
    date: "2026-06-27",
    description: "An AI policy for employees should be short, plain English, and focused on three daily decisions. Here's how to write one that actually gets read and followed.",
    keyword: "ai policy for employees",
    body: [
      { p: "Most AI policies are written by legal or compliance teams for legal or compliance purposes. They are long, formal, and full of conditions. Staff do not read them. An AI policy for employees should be different: a practical, plain-English document that helps people make better decisions every day, not a document they sign and promptly forget. Here is how to write one that actually works." },
      { h: "Start with the three daily decisions", p: "Most employees face the same three questions when they use AI at work: Can I use this tool? Can I put this data into it? Do I need to tell someone I used AI for this? Your policy should answer all three clearly and without jargon. Approved tools should be named or linked directly (not 'check with IT'). Data rules should be concrete: 'do not paste client names or email addresses into any AI tool' is clearer than 'do not process personal data'. Disclosure rules should be specific to context rather than left open to interpretation." },
      { h: "Length: one to two pages", p: "There is an inverse relationship between policy length and compliance. A one-page AI policy with clear rules that staff can scan in under three minutes will be followed more reliably than a ten-page policy covering every edge case. Save the edge cases for an FAQ document or a conversation with the policy owner. Your goal is a document whose key points people can remember after reading it once, because remembered policies get applied; forgotten ones do not." },
      { h: "Plain English over legalese", p: "Write in the second person ('you must', 'you can'). Use short sentences. Avoid defined terms unless essential. If your legal team wants to add definitions and liability clauses, ask them to put those in an appendix and keep the main body readable for someone who is not a lawyer. Compare: 'Employees shall ensure that all processing activities involving AI systems are conducted in accordance with applicable data protection legislation' versus 'Do not paste customer data into an AI tool unless it is on the approved list.' The second version is the one people follow." },
      { h: "Make acknowledgement easy and automatic", p: "Send the policy to every employee with a one-click acceptance mechanism. Set a reminder for anyone who has not acknowledged it within two weeks. When the policy is updated materially, re-send for re-attestation. This does not need to be a complex workflow system: ModelCharter handles policy generation, distribution, and attestation in one place. It takes a morning to set up and runs automatically after that, including sending re-attestation when policies change." },
    ],
  },
  {
    slug: "model-ai-governance-frameworks",
    title: "Comparing AI Governance Frameworks: NIST, ISO 42001 and Beyond",
    date: "2026-06-27",
    description: "NIST AI RMF, ISO 42001 and the EU AI Act approach AI governance differently. How to compare them and which to use as a foundation for your programme.",
    keyword: "model ai governance framework",
    body: [
      { p: "Three major frameworks have emerged as reference standards for AI governance: the NIST AI Risk Management Framework (US, voluntary), ISO/IEC 42001 (international, voluntary, certifiable), and the EU AI Act (EU law, mandatory for organisations with EU reach). Each approaches AI governance from a different angle. Understanding how they relate helps you build a programme that satisfies multiple frameworks without duplicating effort." },
      { h: "NIST AI RMF: risk-management lens", p: "Published in January 2023, the NIST AI RMF organises governance into four functions: GOVERN, MAP, MEASURE, MANAGE. It is designed to be flexible and scalable, applying to organisations of any size and sector. It carries no legal weight but has become the de facto standard for US federal agencies and enterprise risk management. If your organisation is US-headquartered or sells to US government customers, NIST AI RMF is likely the vocabulary your counterparts use when discussing AI risk." },
      { h: "ISO 42001: management system standard", p: "ISO/IEC 42001 is a third-party-certifiable management system standard for AI, analogous to ISO 27001 for information security. It requires documented policies, objectives, risk assessments, and internal audits, and allows external certification as evidence of compliance. It is most relevant for organisations that want to demonstrate AI governance to customers or regulators via a recognised third-party credential, or for those already embedded in the ISO management system ecosystem." },
      { h: "EU AI Act: mandatory law", p: "The EU AI Act is enforceable law with significant penalties, up to 3% of global annual turnover for most violations, 6% for the most serious. It applies to any organisation whose AI systems operate in the EU, regardless of where the organisation is based. Unlike the voluntary frameworks, it does not just guide good practice: it creates binding obligations around prohibited practices, high-risk systems, transparency, and AI literacy. If your organisation has EU operations or EU-facing AI use, this is your compliance floor, not an optional framework to aspire to." },
      { h: "How they complement each other", p: "The frameworks are additive rather than competing. The EU AI Act tells you the minimum you must do by law. ISO 42001 gives you a structured management system to meet those requirements and demonstrate them via external certification. NIST AI RMF provides a risk management vocabulary and toolset that works within either of the above. Many compliance professionals use NIST to identify and assess AI risks, implement controls that satisfy ISO 42001, and document evidence that satisfies the EU AI Act, three outcomes from one set of activities." },
      { h: "Choosing your starting point", p: "If you are subject to the EU AI Act: start there, it is the legal minimum. If you want certifiable evidence of AI governance for customer assurance: add ISO 42001. If you have US operations or want an established risk-management vocabulary: layer in NIST AI RMF. In all cases, the practical starting point is the same: a written AI usage policy, a register of approved tools, and attestation records. Those artefacts satisfy the documentation requirements of all three frameworks. ModelCharter provides that foundation. From there, which framework to pursue in depth depends on your regulatory context and what your customers and auditors expect to see." },
    ],
  },
];

POSTS.push(...WEEK3_POSTS);

// Week 4: net-new coverage of high-value, low-competition keywords the earlier
// batches did not target (ai risk, nist risk management frameworks, ai privacy
// concerns, chatgpt data privacy, ai policy template, enterprise ai governance,
// best ai tools for small business, and a linking-hub governance checklist).
const WEEK4_POSTS: Post[] = [
  {
    slug: "what-is-ai-risk",
    title: "What Is AI Risk? The Categories Every Business Should Know",
    date: "2026-07-01",
    description: "AI risk is the exposure your business takes on when it uses AI tools. The main categories, which ones actually apply to a small team, and how to manage them.",
    keyword: "ai risk",
    body: [
      { p: "AI risk is the exposure a business takes on when it builds, buys, or uses AI. For most organisations the risk is not a science-fiction scenario; it is mundane and immediate: confidential data pasted into a tool that trains on it, a confident but wrong AI answer acted on as fact, or an AI vendor that cannot meet a GDPR or HIPAA obligation. Understanding the categories of AI risk is the first step to managing them without either ignoring AI or banning it." },
      { h: "Data risk: the one that affects everyone", p: "The most common AI risk for a normal business is data exposure. Consumer tiers of many AI tools use your inputs to improve their models by default, and retain conversations for a period. When staff paste customer records, source code, or unreleased plans into those tools, that data can leak into training or be exposed in a breach. This is the risk behind shadow AI, and it is the one a written policy and an approved-tools list address most directly." },
      { h: "Accuracy and over-reliance risk", p: "AI systems produce fluent, confident output that can be wrong, incomplete, or fabricated. The business risk is that staff treat that output as authoritative, especially in legal, financial, medical, or regulatory work. The control is a human-review requirement: a person with domain knowledge checks AI output before it influences an important decision or reaches a customer. State that requirement in your AI policy rather than leaving it to individual judgment." },
      { h: "Compliance and legal risk", p: "Using AI can create regulatory exposure even when nothing goes visibly wrong. Processing EU personal data through a tool with no Data Processing Agreement, or protected health information through a tool with no Business Associate Agreement, is a violation regardless of whether a breach occurs. The EU AI Act adds AI-literacy and transparency duties. These are documentation risks: they cost little to fix if you vet tools before adoption and record your decisions." },
      { h: "How to manage AI risk without a risk team", p: "You do not need a formal enterprise risk function. Keep a register of the AI tools you use and what data flows into each, classify them by sensitivity, and check each tool's data-handling terms before approval. Write a short AI usage policy that captures the rules, and get staff to acknowledge it. ModelCharter's AI Tool Risk Directory scores popular tools for exactly these risks, and the free policy generator turns your decisions into a document your team can sign." },
    ],
  },
  {
    slug: "nist-risk-management-frameworks-compared",
    title: "NIST Risk Management Frameworks Compared: CSF, AI RMF and RMF 800-37",
    date: "2026-07-02",
    description: "NIST publishes several risk management frameworks and they are easy to confuse. How the Cybersecurity Framework, the AI RMF and RMF 800-37 differ, and which applies to AI.",
    keyword: "nist risk management frameworks",
    body: [
      { p: "NIST, the US National Institute of Standards and Technology, publishes several risk management frameworks, and they are easy to mix up because they share a vocabulary and a house style. If you are trying to manage AI risk, the practical question is which one applies. The short answer: the NIST AI Risk Management Framework is the one written for AI, but understanding how it sits alongside the others helps you avoid duplicating work." },
      { h: "NIST Cybersecurity Framework (CSF)", p: "The CSF, updated to version 2.0 in 2024, is the widely-adopted framework for managing cybersecurity risk. It organises work around six functions: Govern, Identify, Protect, Detect, and Respond, plus Recover. It is not AI-specific, but because most AI risk in a normal business is a data-security risk, the CSF's Identify and Protect functions overlap heavily with what you need for AI tools: knowing what you use and controlling access to data." },
      { h: "NIST AI Risk Management Framework (AI RMF)", p: "The AI RMF, published in January 2023, is the framework built specifically for AI. It uses four functions, GOVERN, MAP, MEASURE, and MANAGE, and is paired with a Generative AI Profile (NIST AI 600-1) that tailors it to tools like ChatGPT. This is the framework enterprise buyers and US agencies mean when they ask how you manage AI risk. For a small team, GOVERN (a policy and a named owner) and MAP (an inventory of AI tools) are the actionable starting points." },
      { h: "NIST RMF (SP 800-37)", p: "The NIST Risk Management Framework in Special Publication 800-37 is a different thing again: a seven-step process (Prepare, Categorize, Select, Implement, Assess, Authorize, Monitor) used mainly by US federal agencies and contractors to authorise information systems for operation. Unless you sell to the federal government or handle federal data, 800-37 is probably not the framework you need for everyday AI governance, though its risk vocabulary influenced the others." },
      { h: "Which one to use for AI", p: "For governing the AI tools your team uses, start with the AI RMF, and lean on the CSF for the underlying data-security controls if you already run a security programme. Reserve 800-37 for federal system authorisation. Whichever you adopt, the practical artefacts are the same: a written AI usage policy, a register of approved tools, and a record that staff have read the rules. ModelCharter provides those three, which satisfy the documentation expectations of the AI RMF and map cleanly onto the others. See our frameworks guides for the AI RMF and ISO 42001 in detail." },
    ],
  },
  {
    slug: "ai-privacy-concerns",
    title: "AI Privacy Concerns: What They Are and How to Address Them",
    date: "2026-07-03",
    description: "The real privacy concerns with AI tools, from training on your data to retention and third-party sharing, and the practical steps a business can take to address each.",
    keyword: "ai privacy concerns",
    body: [
      { p: "AI privacy concerns come up in almost every conversation about adopting AI at work, and they are well founded. But the concerns are often vague, which makes them hard to act on. Broken into specifics, most AI privacy concerns fall into four concrete questions you can actually answer for any given tool: does it train on your data, how long does it keep it, who else sees it, and what happens if someone asks for their data back." },
      { h: "Concern 1: is my data used to train the model?", p: "This is the concern people mean most often. On consumer tiers of many AI tools, your inputs are used to improve the vendor's models by default, sometimes with an opt-out most users never find. Once data is in a training set it is effectively irreversible. The fix is to use business or enterprise tiers, which typically exclude your data from training, and to tell staff not to put sensitive data into consumer accounts. Check the specific tier, not the vendor's general reputation." },
      { h: "Concern 2: how long is my data retained?", p: "Even a tool that does not train on your data may retain your prompts and uploads for a period, often 30 to 90 days, for safety and operational reasons. Longer retention means more exposure if the vendor is breached. Some enterprise tiers offer zero or configurable retention. If your team handles sensitive material regularly, retention terms are worth checking before approval, not after." },
      { h: "Concern 3: who else can see the data?", p: "AI vendors use subprocessors (cloud hosting, analytics, moderation) that also touch your data. For personal data, GDPR expects you to know who those subprocessors are, which is why reputable vendors publish a subprocessor list. Human review of flagged content is another path by which your inputs can be seen by a person. A business tier with a Data Processing Agreement gives you contractual clarity on both." },
      { h: "Concern 4: data subject rights and deletion", p: "If personal data enters an AI tool, a data subject access or erasure request under GDPR may require you to retrieve or delete it from the vendor's systems. Confirm your vendor supports deletion on request and understand their retention defaults. Addressing all four concerns comes down to the same routine: check each tool's terms, prefer business tiers, and write the rules into a policy. ModelCharter's tool directory records training, retention, DPA and subprocessor details for popular tools so you are not reading every privacy policy yourself." },
    ],
  },
  {
    slug: "chatgpt-data-privacy",
    title: "ChatGPT Data Privacy: What Happens to What You Type",
    date: "2026-07-04",
    description: "A clear explanation of ChatGPT data privacy: whether OpenAI trains on your chats, how long they are kept, and the difference between the free, Plus, Team and Enterprise tiers.",
    keyword: "chatgpt data privacy",
    body: [
      { p: "ChatGPT data privacy comes down to one question with a tier-dependent answer: what does OpenAI do with what you type? The gap between a personal free account and a business tier is the entire privacy story, and most concern about ChatGPT at work disappears once a team is on the right tier and knows the rules. Here is what actually happens to your data on each." },
      { h: "Free and Plus: training is on by default", p: "On consumer ChatGPT (the free tier and Plus), OpenAI may use your conversations to improve its models unless you turn off 'Improve the model for everyone' in data controls. Most users never change that setting. So work data pasted into a personal free or Plus account can flow into model training. This is the classic shadow-AI exposure, and it is why personal accounts are not appropriate for company data." },
      { h: "Team, Enterprise and the API: not trained on by default", p: "OpenAI does not train on inputs or outputs from ChatGPT Team, ChatGPT Enterprise, or the API platform by default. These tiers also add admin controls, SSO on Enterprise, and a Data Processing Agreement for GDPR. For any work involving client data, personal data, or confidential plans, ChatGPT Team is the minimum sensible tier, and Enterprise adds SSO and configurable retention on top." },
      { h: "Retention: how long chats stick around", p: "Consumer chats are retained until you delete them, with deleted conversations typically purged around 30 days later. ChatGPT Enterprise and Team offer customer-configurable retention. The API defaults to roughly 30 days of logging, with Zero Data Retention available for eligible endpoints. If retention matters for your use case, the business and API tiers are where you get control over it." },
      { h: "What this means for your team", p: "The practical ChatGPT data privacy policy is short: use the company ChatGPT Team or Enterprise workspace, never personal accounts, for anything work-related; do not enter secrets, customer data, or confidential plans into any consumer AI tool; and record the approved tier in your AI usage policy so it is a rule rather than a hope. ModelCharter's directory has ChatGPT's full data-handling profile, sourced from OpenAI's own policies, and the policy generator turns the tier decision into a signed team rule." },
    ],
  },
  {
    slug: "ai-policy-template",
    title: "AI Policy Template: A Free, Editable Structure for 2026",
    date: "2026-07-05",
    description: "A practical AI policy template you can adapt, section by section, plus a free generator that fills it in for your company type, data sensitivity and regulatory context.",
    keyword: "ai policy template",
    body: [
      { p: "An AI policy template gives you a starting structure so you are not staring at a blank page. The risk with any template is that it stays generic: a document you paste your logo onto and file away, without the specifics that make staff actually follow it. Use the structure below as a skeleton, then tailor each section to how your team really works. The sections that matter most are the data rules and the approved-tools list." },
      { h: "Section 1: scope and purpose", p: "State who the policy applies to (employees, contractors, anyone acting for the organisation) and what counts as an AI tool: standalone assistants, AI features inside other software, and anything that sends your data to a third-party model. Add one line on why the policy exists, so people understand it protects the business and them, not just a compliance box." },
      { h: "Section 2: approved tools and tiers", p: "This is the section staff will actually reference. List the AI tools that are approved and, critically, at what tier (for example 'ChatGPT Team, not personal free or Plus accounts'). Name what is not approved for work. Link to a process for requesting a new tool. An approved-tools list that names tiers prevents the most common failure, which is staff using a personal consumer account for company data." },
      { h: "Section 3: data rules", p: "The heart of the policy. Be concrete: 'do not paste customer names, email addresses, financial data, source code, or unreleased plans into any AI tool that is not on the approved list.' Concrete beats abstract; 'do not process personal data' is too vague for a busy employee to apply. Add a stricter rule for regulated data if you handle health, legal, or financial information." },
      { h: "Section 4: review, transparency, owner, and attestation", p: "Require human review of AI output before it goes to a customer or informs an important decision. Say when staff must disclose AI involvement. Name one owner who approves tools and answers questions. Finally, record that staff have read and accepted the policy, which is what evidences the EU AI Act's AI-literacy duty and satisfies SOC 2 auditors. Rather than fill this template in by hand, ModelCharter's free policy generator asks about your company type, data sensitivity, and regulatory context and produces a tailored, attestation-ready policy in minutes." },
    ],
  },
  {
    slug: "enterprise-ai-governance",
    title: "Enterprise AI Governance: Scaling Policy, Registry and Controls",
    date: "2026-07-06",
    description: "Enterprise AI governance adds scale, roles and evidence to the basics. What changes as you grow past a single policy, and how to keep governance active rather than theatre.",
    keyword: "enterprise ai governance",
    body: [
      { p: "Enterprise AI governance is the same three artefacts every organisation needs, a policy, a tool register, and attestation records, operated at a scale where a single shared document and an honour system stop being enough. As headcount, regulatory exposure, and the number of AI tools grow, governance needs roles, evidence, and controls that hold up to an audit. The goal is to add that structure without turning governance into theatre that everyone routes around." },
      { h: "What changes as you scale", p: "At 20 people, one owner and a one-page policy is credible governance. At 500, you need defined roles (who approves tools, who owns the policy, who handles incidents), a versioned policy with a change history, a tool register that distinguishes approved, restricted, and prohibited tools by data type, and attestation that tracks every employee including new joiners. The substance is unchanged; the difference is that everything must now be provable to a customer or regulator, not just asserted." },
      { h: "The AI tool register becomes central", p: "At enterprise scale the register is the workhorse. It records every AI tool in use, who owns it, what data flows into it, its risk rating, the approved use cases, and the date last reviewed. It doubles as vendor-management evidence for SOC 2 and as the system inventory the EU AI Act and ISO 42001 expect. Shadow AI is the biggest gap: the register is only as good as your ability to find the tools staff adopt without asking, so make requesting a new tool easier than going around the process." },
      { h: "Controls and evidence", p: "Enterprises are asked not just whether a control exists but whether it operates. That means SSO on AI tools so access is centrally revocable, DPAs and BAAs on file for tools that touch regulated data, an approval workflow with a record of who approved what, and an audit log. Mapping these controls to a framework (ISO 42001 or SOC 2) turns your governance into evidence you can hand an auditor rather than a story you tell them." },
      { h: "Keeping it active, not decorative", p: "The failure mode at scale is governance that exists on paper but not in practice: a policy no one has read, a register no one updates. Guard against it with a review cadence, annual re-attestation, and a named owner who is accountable. ModelCharter gives you the versioned policy, the tool register with approval states, and attestation tracking in one place, with framework control mapping on the Business tier for teams that need to show their governance to auditors. Governance that runs beats a perfect framework still being designed." },
    ],
  },
  {
    slug: "best-ai-tools-for-small-business",
    title: "Best AI Tools for Small Business: Safe Picks by Use Case",
    date: "2026-07-06",
    description: "The best AI tools for small business balance usefulness with safe data handling. Recommended picks by use case, and the tier and data rules that keep them safe.",
    keyword: "best ai tools for small business",
    body: [
      { p: "The best AI tools for a small business are the ones that are genuinely useful and safe to use with your data on a tier you can afford. A small team feels AI risk differently from an enterprise: there is no IT department to vet tools, budgets are tight, and one person often wears the ops, HR, and security hats. The good news is that the mainstream tools have safe tiers, and the decision usually comes down to which ecosystem you are already in." },
      { h: "General assistant: ChatGPT or Claude", p: "For a general-purpose assistant, ChatGPT Team or Claude for Work are both sensible small-business picks: neither trains on your data on those tiers, both offer admin controls, and both provide a Data Processing Agreement for GDPR. Choose on fit and price. What matters more than which you pick is that the whole team uses the shared business workspace, not personal free accounts, for anything involving company or customer data." },
      { h: "If you live in Microsoft or Google", p: "If your business already runs on Microsoft 365, Copilot is the natural choice: it works inside apps you already use, does not train foundational models on your data, and is covered by your existing Microsoft DPA. If you are a Google Workspace business, Gemini for Workspace is the equivalent. In both cases the only trap is staff using the consumer version (Bing Copilot or personal Gemini) for work, which runs under weaker terms. Approve the business product explicitly." },
      { h: "Meetings and notetakers: check before you record", p: "AI notetakers like Otter, Fireflies, and the built-in assistants in Zoom and Teams are hugely useful for small teams, but they capture client names, plans, and personal data, and their consumer tiers vary widely on training and retention. This is the category to vet most carefully. Confirm the tier does not train on your transcripts, check retention, and get consent to record where the law requires it." },
      { h: "How to choose safely without an IT team", p: "For any AI tool a small business is considering: confirm the specific tier excludes your data from training, check for a DPA (and a BAA if you handle health data), and make sure staff use the business account rather than a personal one. Write the approved list into a short AI usage policy so the rules survive staff turnover. ModelCharter's AI Tool Risk Directory has already done this evaluation for the most popular tools, so a small team can check a tool in a couple of minutes instead of reading a privacy policy from scratch." },
    ],
  },
  {
    slug: "ai-governance-checklist",
    title: "AI Governance Checklist: 10 Steps for a Team Without a Compliance Department",
    date: "2026-07-07",
    description: "A practical AI governance checklist any ops, IT or HR lead can work through in a day: policy, tool register, attestation, and the framework obligations behind each step.",
    keyword: "ai governance checklist",
    body: [
      { p: "AI governance sounds like a programme that needs a department. For a small or mid-sized team it is really a checklist you can work through in a day and then maintain in an hour a quarter. This is that checklist: ten practical steps that, done in order, take you from no governance to a defensible position you can show a customer, an auditor, or a regulator. Each step maps to a real obligation under the EU AI Act, GDPR, ISO 42001, or SOC 2." },
      { h: "Steps 1 to 3: see what you actually use", p: "Step 1: inventory your AI tools, including the ones bought by individuals and the AI features inside other software. Step 2: for each, note what data flows into it. Step 3: classify by sensitivity (public, internal, personal, regulated). This is the MAP function of the NIST AI RMF and the system inventory ISO 42001 expects. Shadow AI is usually most of what you find, so ask every team, not just IT." },
      { h: "Steps 4 to 6: vet and decide", p: "Step 4: for each tool touching sensitive data, check whether it trains on your inputs, its retention, and whether it offers a DPA or BAA. Step 5: decide a status for each tool: approved, restricted, or prohibited, and at which tier. Step 6: record those decisions in a tool register. ModelCharter's AI Tool Risk Directory does step 4 for popular tools, with a source link per fact, so this is minutes rather than hours per tool." },
      { h: "Steps 7 to 9: write it down and get sign-off", p: "Step 7: write a short AI usage policy capturing the data rules, the approved-tools list, a human-review requirement, and a named owner. Step 8: circulate it and collect attestation, a timestamped record that each person read and accepted it, which is what evidences the EU AI Act's Article 4 AI-literacy duty. Step 9: set a review cadence, at least annual re-attestation and a re-check whenever a tool's terms change or you add a tool." },
      { h: "Step 10: keep it current", p: "Step 10: keep the underlying facts fresh. Vendors change their terms; a tool that was safe on a given tier may not stay that way. Re-check the directory periodically and update your register. ModelCharter covers steps 4 through 9 directly: the directory, the policy generator, the tool register and attestation. Work the list once and you are ahead of most companies your size; maintain it and you stay there." },
    ],
  },
];

POSTS.push(...WEEK4_POSTS);

// Week 5: ported from the retired Vetlark prototype (the same product built by
// another team), rewritten into ModelCharter's voice. Only the posts that do
// NOT duplicate the new registry/compliance pages were kept, to avoid competing
// with our own head-term pages for the same citation slot.
const WEEK5_POSTS: Post[] = [
  {
    slug: "consumer-vs-business-ai-tiers",
    title: "Consumer vs business AI tiers: why the tier changes everything",
    date: "2026-07-05",
    description:
      "The same AI product can be two entirely different risk profiles depending on which plan someone signs up for. Here's why the tier matters more than the brand name.",
    keyword: "consumer vs business ai",
    body: [
      {
        p: "Ask 'is ChatGPT safe for sensitive data' and you are asking the wrong-shaped question. ChatGPT Free, ChatGPT Plus, ChatGPT Business, ChatGPT Enterprise and the API are five different products wearing one name, with meaningfully different data policies. This pattern repeats across nearly every major AI vendor, and the tier is frequently a bigger factor in your actual risk than the brand's general reputation for security.",
      },
      {
        h: "The pattern, in plain terms",
        p: "Consumer and free tiers exist to drive adoption at scale, with cheap or free access, fast sign-up, and terms written for individuals rather than organisations. Business and enterprise tiers exist to win procurement decisions, and procurement teams ask about training, retention, BAAs and DPAs, so vendors build those protections into the paid tier's contract, not the free one. The free tier isn't necessarily less secure technically; it is built for a different legal relationship with a different set of commitments attached.",
      },
      {
        h: "Concrete examples of the split",
        p: "The splits are concrete. With ChatGPT, Business, Enterprise and API data is excluded from training by default, while the free and Plus tier trains on conversations unless you opt out yourself. With Gemini, Workspace and Vertex AI exclude your content from training and inherit Google Cloud's HIPAA BAA, while the consumer Gemini app has a different default and no BAA coverage. GitHub Copilot Business and Enterprise do not retain or train on prompts and suggestions, whereas individual accounts have an opt-out that isn't the default. Perplexity Enterprise Pro excludes customer data from training and adds SSO, while the consumer product may use queries to improve the service unless you change a setting.",
      },
      {
        h: "Why this trips teams up",
        p: "Vendor evaluations tend to happen at the brand level: someone researches 'is ChatGPT secure', reads good things about Enterprise, and assumes the answer covers whatever plan the team ends up on. In practice, teams frequently start on a free or individual tier during evaluation (or an employee already has a personal account) and never formally migrate to the vetted business tier, so the actual usage sits on a different, unvetted set of terms than the one that got approved. Every tool profile in ModelCharter's AI Tool Risk Directory states the specific safe tier required for its sourced protections to apply, so check that field before assuming a whole-brand answer covers your team's actual plan.",
      },
      {
        h: "What to actually do about it",
        p: "So make the tier explicit. When approving a tool, name the specific tier in the approval, not just the product: 'ChatGPT Business or Enterprise', not 'ChatGPT'. Check whether anyone is already using a personal or free account for work, and migrate them to the approved tier rather than assuming everyone already is. Re-verify the tier's specific protections periodically, since vendors do shift what is included in each plan over time. And when a vendor's marketing says 'enterprise-grade', confirm that language actually describes your plan, not just their highest available one.",
      },
      {
        p: "The single highest-leverage sentence you can add to any AI usage policy is often just: 'use the Business or Enterprise plan of this tool, never the free one.' It doesn't require banning anything, and it closes most of the gap between a tool's advertised security posture and what a given employee is actually using. You can check the specific safe tier for any AI tool in ModelCharter's AI Tool Risk Directory, sourced from the vendor's own documentation, and if you are not sure which tier your team is on, the free AI vendor risk assessment at /ai-vendor-risk-assessment walks you through it.",
      },
    ],
  },
  {
    slug: "how-to-vet-an-ai-tool-before-rollout",
    title: "How to vet an AI tool before you roll it out to your team",
    date: "2026-07-06",
    description:
      "A practical, repeatable checklist for the gap between 'someone found a useful AI tool' and 'the whole team is using it', without turning every request into a month-long review.",
    keyword: "how to vet an ai tool",
    body: [
      {
        p: "The moment an AI tool goes from 'one person trying it out' to 'the whole team relies on it', the risk profile changes completely: more data, more people, more assumption that someone already checked it. Most teams either skip this step entirely (shadow AI) or turn it into a weeks-long process that people route around. Here is a middle path that is fast enough to actually get used.",
      },
      {
        h: "Step 1: name the data before anything else",
        p: "Before checking a single vendor policy, get specific about what will actually go through the tool: customer PII, health information, source code, financial records, or just general internal drafting. The data type determines which questions matter. PHI needs a HIPAA BAA question, EU personal data needs a GDPR DPA question, and proprietary code needs a training-and-retention question. Skipping this step is how teams end up checking the wrong things.",
      },
      {
        h: "Step 2: check the sourced facts, not the reputation",
        p: "Check the facts that actually matter, and get them from a source. Training posture: does it train on inputs, and does that depend on plan tier? HIPAA BAA: required only if PHI is in scope, but confirm either way. GDPR DPA: required if EU or UK personal data is in scope. SOC 2 or ISO 27001: a baseline security hygiene signal, not proof of the above. Data residency and subprocessors: relevant if you have jurisdiction-specific requirements. Get each answer from the vendor's own trust center, DPA or enterprise-privacy page, not from the product's general reputation or a colleague's impression of it. If a fact isn't documented anywhere public, ask the vendor directly and keep the written answer as your source. ModelCharter's AI Tool Risk Directory has already done this lookup for the most common AI tools, so check a tool's profile first before starting a manual review; it may save the whole step.",
      },
      {
        h: "Step 3: pin the tier, not just the tool",
        p: "Almost every finding from Step 2 applies to a specific plan tier, not the product as a whole. Decide and document which tier is approved ('Business or Enterprise only'), and check whether anyone already using the tool is on a different one: a free or personal account someone signed up with before the review even started.",
      },
      {
        h: "Step 4: write the verdict down",
        p: "A one-paragraph record, covering what was checked, what the source said, which tier it applies to, and the resulting verdict (approve, conditional, reject, or needs more info), is what turns a one-time conversation into something an auditor, a customer security questionnaire, or your own future self can actually rely on. Skipping documentation is the most common reason the same tool gets re-discovered and re-debated six months later.",
      },
      {
        h: "Step 5: set a recheck trigger",
        p: "Set a trigger for rechecking, whichever comes first: a fixed cadence, where six or twelve months is typical for a full re-review; any vendor terms-of-service or privacy-policy update; any publicly disclosed security incident; or a plan-tier change for your team, whether upgrading, downgrading, or adding new seats. None of this needs to take weeks. For a vendor with a public trust center and documented DPA, the whole process, from 'someone wants to use this' to a written, sourced verdict, realistically takes fifteen to thirty minutes once you know what to check. A free, structured template at /ai-vendor-risk-assessment walks through exactly these steps, and you can check whether the tool your team wants is already vetted in ModelCharter's AI Tool Risk Directory.",
      },
    ],
  },
  {
    slug: "shadow-ai-tools-at-work",
    title: "Shadow AI: the tools your team already uses (and the risk)",
    date: "2026-07-07",
    description:
      "Your official AI policy and your actual AI usage are two different lists. Here's why the gap exists, where the real risk sits, and how to close it without a ban nobody follows.",
    keyword: "shadow ai tools",
    body: [
      {
        p: "Ask most security or IT leaders which AI tools their organisation uses, and you will get a short, tidy list: the ones that were formally approved. Ask the same question of individual employees, and the real list is usually much longer: a browser extension someone installed to summarise emails, a free transcription app a manager uses for one-on-ones, a personal ChatGPT account a marketer relies on for first drafts. That gap between the approved list and the actual list is shadow AI, and closing your eyes to it doesn't shrink it.",
      },
      {
        h: "Why it happens",
        p: "AI tools are uniquely easy to adopt without anyone noticing. There is often no purchase order, no IT ticket, no install beyond a browser tab and an email address. An employee under deadline pressure who finds a tool that saves them an hour isn't trying to create risk; they are solving their immediate problem with whatever is available, and a formal procurement process is rarely available at 4pm on a Thursday.",
      },
      {
        h: "Where the risk actually sits",
        p: "The risk isn't the existence of the tool; it is what goes through it once real data enters the picture. A support rep pastes a customer's account details into a chatbot to draft a reply. A paralegal uploads a contract to get a quick summary. A clinician runs patient notes through a free transcription tool because it is faster than typing. None of that shows up on an approved-vendor list, and none of it gets caught if the vendor changes its data policy six months later, because nobody who owns vendor risk knows the tool is in use at all. There is a second, subtler risk: even for tools that are 'approved' at the brand level, employees often end up on the free or personal tier rather than the business tier that was actually vetted. The same product name can carry a materially different training and retention posture depending on which plan someone happens to be signed up on, a distinction that gets lost the moment someone says 'oh yeah, we use that.'",
      },
      {
        h: "What doesn't work",
        p: "Blanket bans tend to backfire. They do not remove the underlying pressure that drove adoption in the first place, so usage doesn't stop; it just moves further out of sight, onto personal devices and personal accounts where there is even less visibility than before. A policy nobody can realistically comply with produces quiet non-compliance, not compliance.",
      },
      {
        h: "What actually closes the gap",
        p: "Closing the gap takes four moves. Find out what is really in use, through expense reports, SSO or OAuth app logs, or simply asking teams directly what they have adopted on their own. Build a living register, not a one-time survey, since new tools get adopted faster than any annual review cycle can track, so the register needs to be something people add to as they go. Vet quickly, not eventually: a fast, lightweight risk check (training posture, BAA or DPA availability, SOC 2) beats a slow formal process that people route around out of necessity. And give tier-specific guidance: 'use the Business plan of this tool, not the free one' is often the single highest-leverage instruction you can give, since it fixes the risk without taking the tool away. ModelCharter's AI Tool Risk Directory lets you look up any AI tool's sourced risk facts in seconds, and the team dashboard keeps a living tool register, so shadow AI becomes visible AI instead.",
      },
      {
        h: "The realistic goal",
        p: "You are not trying to get to zero unapproved tools; that is not achievable, and chasing it wastes effort that would be better spent elsewhere. The realistic goal is a register that reflects what is actually happening, a fast path to vet new tools as they come up, and clear guidance on which tier of each tool is safe. That turns shadow AI from an unknown liability into a known, managed one. The free AI vendor risk assessment at /ai-vendor-risk-assessment is a good place to start, and the team dashboard's tool register keeps track of everything your team actually uses.",
      },
    ],
  },
];

POSTS.push(...WEEK5_POSTS);

const POST_IMAGES: Record<string, PostImage> = {
  "what-is-ai-governance": {
    src: "https://images.pexels.com/photos/8566470/pexels-photo-8566470.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "AI robot representing artificial intelligence governance for business teams",
    author: "Kindel Media",
    authorUrl: "https://www.pexels.com/@kindelmedia",
  },
  "what-is-shadow-ai": {
    src: "https://images.pexels.com/photos/1081675/pexels-photo-1081675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Shadow silhouette representing shadow AI and hidden technology risks at work",
    author: "Juan Pablo Serrano",
    authorUrl: "https://www.pexels.com/@juanpphotoandvideo",
  },
  "how-to-write-an-ai-usage-policy": {
    src: "https://images.pexels.com/photos/204511/pexels-photo-204511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Notebook and pen on a desk for writing an AI usage policy",
    author: "David Bares",
    authorUrl: "https://www.pexels.com/@david-bares-42311",
  },
  "eu-ai-act-for-small-business": {
    src: "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Person reviewing EU AI Act compliance documents and legal regulations",
    author: "Sora Shimazaki",
    authorUrl: "https://www.pexels.com/@sora-shimazaki",
  },
  "is-chatgpt-safe-for-work": {
    src: "https://images.pexels.com/photos/16094043/pexels-photo-16094043.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Person using an AI chatbot on a laptop computer for work",
    author: "Matheus Bertelli",
    authorUrl: "https://www.pexels.com/@bertellifotografia",
  },
  "ai-governance-software-guide": {
    src: "https://images.pexels.com/photos/34069/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Business analytics dashboard on a laptop for AI governance software",
    author: "Negative Space",
    authorUrl: "https://www.pexels.com/@negativespace",
  },
  "ai-compliance-software-guide": {
    src: "https://images.pexels.com/photos/144230/pexels-photo-144230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Professional working on a laptop reviewing AI compliance software",
    author: "JÉSHOOTS",
    authorUrl: "https://www.pexels.com/@jeshoots",
  },
  "ai-data-privacy-guide": {
    src: "https://images.pexels.com/photos/4808267/pexels-photo-4808267.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Padlock on keyboard representing AI data privacy and cybersecurity",
    author: "Ewan Kennedy",
    authorUrl: "https://www.pexels.com/@ewankennedy",
  },
  "ai-risk-assessment-guide": {
    src: "https://images.pexels.com/photos/9034223/pexels-photo-9034223.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Business team conducting an AI risk assessment and evaluation",
    author: "RDNE Stock project",
    authorUrl: "https://www.pexels.com/@rdne",
  },
  "ai-acceptable-use-policy": {
    src: "https://images.pexels.com/photos/261621/pexels-photo-261621.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Person signing a business agreement representing an AI acceptable use policy",
    author: "Pixabay",
    authorUrl: "https://www.pexels.com/@pixabay",
  },
  "chatgpt-for-business-policy": {
    src: "https://images.pexels.com/photos/6995246/pexels-photo-6995246.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Team using communication tools representing a ChatGPT business policy",
    author: "Julia M Cameron",
    authorUrl: "https://www.pexels.com/@julia-m-cameron",
  },
  "generative-ai-policy-guide": {
    src: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Robot technology representing generative AI policy for creative work",
    author: "Tara Winstead",
    authorUrl: "https://www.pexels.com/@tara-winstead",
  },
  "ai-tool-security-checklist": {
    src: "https://images.pexels.com/photos/4489171/pexels-photo-4489171.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Digital security shield protecting technology for the AI tool security checklist",
    author: "Dan Nelson",
    authorUrl: "https://www.pexels.com/@dan-nelson-1667453",
  },
  "ai-policy-for-startups": {
    src: "https://images.pexels.com/photos/8117414/pexels-photo-8117414.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Small startup team collaborating in an office for AI policy",
    author: "Ivan S",
    authorUrl: "https://www.pexels.com/@ivan-s",
  },
  "hipaa-ai-compliance-guide": {
    src: "https://images.pexels.com/photos/8376171/pexels-photo-8376171.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Healthcare professional using technology representing HIPAA AI compliance",
    author: "Tima Miroshnichenko",
    authorUrl: "https://www.pexels.com/@tima-miroshnichenko",
  },
  "gdpr-ai-tools-guide": {
    src: "https://images.pexels.com/photos/2882638/pexels-photo-2882638.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "GDPR data protection concept representing EU privacy requirements for AI tools",
    author: "Miguel Á. Padriñán",
    authorUrl: "https://www.pexels.com/@padrinan",
  },
  "employee-ai-training-requirements": {
    src: "https://images.pexels.com/photos/9487617/pexels-photo-9487617.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Employee AI training workshop for EU AI Act literacy requirements",
    author: "Monstera Production",
    authorUrl: "https://www.pexels.com/@gabby-k",
  },
  "ai-governance-framework-guide": {
    src: "https://images.pexels.com/photos/14212986/pexels-photo-14212986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Government building pillars representing the structure of an AI governance framework",
    author: "White Noiise",
    authorUrl: "https://www.pexels.com/@white-noiise-77351716",
  },
  "iso-42001-guide": {
    src: "https://images.pexels.com/photos/12324202/pexels-photo-12324202.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "ISO certification standards representing the ISO 42001 AI management system",
    author: "qmicertification design",
    authorUrl: "https://www.pexels.com/@qmicertification-design-243125480",
  },
  "responsible-ai-guide": {
    src: "https://images.pexels.com/photos/8276364/pexels-photo-8276364.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Handshake representing trust and cooperation in responsible AI practices",
    author: "PNW Production",
    authorUrl: "https://www.pexels.com/@pnw-prod",
  },
  "what-is-ai-compliance": {
    src: "https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Scales of justice representing AI compliance and legal obligations for business",
    author: "Sora Shimazaki",
    authorUrl: "https://www.pexels.com/@sora-shimazaki",
  },
  "nist-ai-risk-management-framework": {
    src: "https://images.pexels.com/photos/6120213/pexels-photo-6120213.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Risk management strategy planning documents for the NIST AI Risk Management Framework",
    author: "Nataliya Vaitkevich",
    authorUrl: "https://www.pexels.com/@n-voitkevich",
  },
  "copilot-data-privacy-guide": {
    src: "https://images.pexels.com/photos/1181207/pexels-photo-1181207.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Professional using a laptop computer representing Microsoft Copilot data privacy",
    author: "Christina Morillo",
    authorUrl: "https://www.pexels.com/@divinetechygirl",
  },
  "ai-governance-tools-guide": {
    src: "https://images.pexels.com/photos/5223887/pexels-photo-5223887.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Technology platform and software tools for AI governance management",
    author: "Godfrey Atima",
    authorUrl: "https://www.pexels.com/@godiatima",
  },
  "soc-2-ai-guide": {
    src: "https://images.pexels.com/photos/7947759/pexels-photo-7947759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Security audit and business report representing SOC 2 AI compliance requirements",
    author: "RDNE Stock project",
    authorUrl: "https://www.pexels.com/@rdne",
  },
  "ai-vendor-risk-assessment": {
    src: "https://images.pexels.com/photos/4963359/pexels-photo-4963359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Business contract signing for AI vendor risk assessment checklist",
    author: "Ketut Subiyanto",
    authorUrl: "https://www.pexels.com/@ketut-subiyanto",
  },
  "chatgpt-for-work": {
    src: "https://images.pexels.com/photos/4468092/pexels-photo-4468092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Person typing on a laptop representing ChatGPT at work and productivity",
    author: "Kaboompics",
    authorUrl: "https://www.pexels.com/@karola-g",
  },
  "what-is-ai-attestation": {
    src: "https://images.pexels.com/photos/7567551/pexels-photo-7567551.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Pen signing a form representing AI attestation and policy acknowledgement",
    author: "Tima Miroshnichenko",
    authorUrl: "https://www.pexels.com/@tima-miroshnichenko",
  },
  "code-of-conduct-for-ai": {
    src: "https://images.pexels.com/photos/10815211/pexels-photo-10815211.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Compass representing values and ethics in a code of conduct for AI use",
    author: "Brett Jordan",
    authorUrl: "https://www.pexels.com/@brettjordan",
  },
  "ai-risk-management-guide": {
    src: "https://images.pexels.com/photos/5439481/pexels-photo-5439481.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Team planning strategy at a whiteboard for AI risk management",
    author: "Tima Miroshnichenko",
    authorUrl: "https://www.pexels.com/@tima-miroshnichenko",
  },
  "best-ai-tools-for-business": {
    src: "https://images.pexels.com/photos/20870805/pexels-photo-20870805.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "AI apps on mobile and computer representing the best AI tools for business",
    author: "Solen Feyissa",
    authorUrl: "https://www.pexels.com/@solenfeyissa",
  },
  "ai-policy-for-employees": {
    src: "https://images.pexels.com/photos/15635235/pexels-photo-15635235.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Employee handbook and workplace rules for an AI policy for employees",
    author: "Walls.io",
    authorUrl: "https://www.pexels.com/@walls-io-440716388",
  },
  "model-ai-governance-frameworks": {
    src: "https://images.pexels.com/photos/7580765/pexels-photo-7580765.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    alt: "Business data charts comparing AI governance frameworks including NIST and ISO 42001",
    author: "RDNE Stock project",
    authorUrl: "https://www.pexels.com/@rdne",
  },
};

POSTS.forEach((p) => {
  if (POST_IMAGES[p.slug]) p.image = POST_IMAGES[p.slug];
});

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
