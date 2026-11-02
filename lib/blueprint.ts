import { z } from 'zod';

export const goals = [
  { id: 'automate', title: 'Automate my operations', description: 'Less repetitive work. More room to grow.', icon: 'workflow' },
  { id: 'build', title: 'Build a digital product', description: 'Turn an idea into a useful web or mobile experience.', icon: 'code' },
  { id: 'modernize', title: 'Improve an existing system', description: 'Make your platform faster, safer, and ready to scale.', icon: 'layers' },
  { id: 'grow', title: 'Grow my digital presence', description: 'Help the right people find you and take the next step.', icon: 'growth' },
  { id: 'explore', title: 'I’m still figuring it out', description: 'Start with a discovery conversation. You don’t need a technical brief.', icon: 'compass' },
] as const;
export type Goal = typeof goals[number]['id'];
export const scopes: Record<Goal, { id: string; label: string }[]> = {
  automate: [{id:'leads',label:'Lead follow-up'}, {id:'documents',label:'Document processing'}, {id:'support',label:'Customer support'}, {id:'integration',label:'Connect existing tools'}, {id:'reporting',label:'Reports & dashboards'}, {id:'approval',label:'Human review & approvals'}],
  build: [{id:'website',label:'Website or web app'}, {id:'mobile',label:'Mobile experience'}, {id:'accounts',label:'User accounts'}, {id:'payments',label:'Payments & subscriptions'}, {id:'dashboard',label:'Admin dashboard'}, {id:'integration',label:'Third-party integrations'}],
  modernize: [{id:'speed',label:'Speed & reliability'}, {id:'cloud',label:'Cloud migration'}, {id:'security',label:'Security & access'}, {id:'legacy',label:'Legacy code'}, {id:'integration',label:'System integrations'}, {id:'reporting',label:'Observability & reporting'}],
  grow: [{id:'seo',label:'Technical SEO'}, {id:'conversion',label:'Landing page conversion'}, {id:'analytics',label:'Analytics & tracking'}, {id:'ads',label:'Paid acquisition'}, {id:'crm',label:'CRM & lead nurturing'}, {id:'content',label:'Content discoverability'}],
  explore: [{id:'manual',label:'Too much manual work'}, {id:'new',label:'An idea to validate'}, {id:'slow',label:'A slow or unreliable system'}, {id:'leads',label:'Not enough qualified leads'}, {id:'unclear',label:'Priorities are unclear'}],
};
export const stages = [{id:'idea',label:'An idea or a fresh start'}, {id:'existing',label:'An existing product or process'}] as const;
export const budgets = [{id:'discuss',label:'Help me define a budget'}, {id:'under1',label:'Under ₹1 lakh'}, {id:'1to3',label:'₹1–3 lakh'}, {id:'3to10',label:'₹3–10 lakh'}, {id:'over10',label:'₹10 lakh+'}] as const;
export const timings = [{id:'flexible',label:'Flexible — quality comes first'}, {id:'soon',label:'Within a month'}, {id:'quarter',label:'Within 1–3 months'}, {id:'later',label:'3+ months / exploring'}] as const;
export const inputSchema = z.object({
  goal: z.enum(['automate','build','modernize','grow','explore']),
  stage: z.enum(['idea','existing']),
  features: z.array(z.string().max(40)).min(1,'Choose at least one focus area.').max(6),
  context: z.string().trim().max(600).default(''),
  budget: z.enum(['discuss','under1','1to3','3to10','over10']),
  timing: z.enum(['flexible','soon','quarter','later']),
}).strict().superRefine((input, ctx) => {
  const allowed = scopes[input.goal].map(x => x.id);
  if (input.features.some(id => !allowed.includes(id))) ctx.addIssue({code:'custom',path:['features'],message:'Choose focus areas that match your goal.'});
  if (new Set(input.features).size !== input.features.length) ctx.addIssue({code:'custom',path:['features'],message:'Focus areas must be unique.'});
});
export type BlueprintInput = z.infer<typeof inputSchema>;
export type Blueprint = {
  version: '1.0'; createdAt: string; service: string; rationale: string; goal: string;
  focus: string[]; stage: string; budget: string; timing: string; context: string;
  approach: string; phases: {name: string; detail: string}[]; questions: string[];
  acceptance: string[]; considerations: string[];
};
const serviceMap: Record<Goal, {name:string;reason:string;first:string;build:string;measure:string}> = {
  automate: {name:'AI & workflow automation',reason:'Your goal is to reduce repetitive work. Start with one measurable workflow, then decide whether rules, integrations, or AI are the right fit.',first:'Map one repetitive process, its inputs, exceptions, and current time cost.',build:'Connect the required tools and pilot one workflow with a human approval step.',measure:'Compare handling time and error rate against the original workflow.'},
  build: {name:'Custom software development',reason:'Your goal is a new digital experience. Validate the core user journey before expanding the product.',first:'Define the primary user, their problem, and the smallest useful release.',build:'Prototype the core journey, then implement the agreed first-release features.',measure:'Verify the core task works end to end and test it with intended users.'},
  modernize: {name:'Software & cloud modernization',reason:'Your goal is a stronger technical foundation. An audit should establish the bottleneck before choosing a migration or rewrite.',first:'Measure the current system and identify reliability, performance, and security risks.',build:'Improve the highest-impact bottleneck with staged rollout and rollback support.',measure:'Compare the agreed performance and reliability metrics against a recorded baseline.'},
  grow: {name:'Technical SEO & conversion',reason:'Your goal is qualified demand. Diagnose discovery and conversion together so more traffic can become useful inquiries.',first:'Audit acquisition, page speed, tracking, and the visitor-to-inquiry journey.',build:'Ship a focused improvement to discoverability or the conversion path.',measure:'Measure qualified inquiry rate and organic discovery with an agreed attribution window.'},
  explore: {name:'Discovery & opportunity mapping',reason:'Your direction is still open. A short discovery exercise can clarify the business problem before committing to a solution.',first:'Map your current process, intended users, and the outcome that matters most.',build:'Compare a small set of solution options and prototype the riskiest assumption.',measure:'Agree on a prioritized problem statement and a clear go/no-go decision.'},
};
export function createBlueprint(input: BlueprintInput, now = new Date()): Blueprint {
  const service = serviceMap[input.goal];
  const focus = scopes[input.goal].filter(x=>input.features.includes(x.id)).map(x=>x.label);
  const considerations = ['This is a planning aid, not a quote or delivery commitment. Cynbit should validate scope, cost, and timing during discovery.'];
  if (input.features.length >= 4) considerations.push('You selected several focus areas. Prioritize one core outcome for the first release and phase the remaining work.');
  if (input.timing === 'soon') considerations.push('A launch within a month is a constraint to validate. Begin with an audit or a narrowly scoped pilot; the full scope may need a later phase.');
  if (input.budget === 'under1') considerations.push('For a budget under ₹1 lakh, discuss a focused audit or proof of concept before committing to a complete system. This is scope guidance, not Cynbit pricing.');
  if (input.budget === 'discuss') considerations.push('Budget is open. Ask for options with explicit inclusions, exclusions, and ongoing operating costs.');
  if (input.features.includes('payments')) considerations.push('Payments need a provider, webhook verification, and decisions about refunds, billing, and applicable compliance.');
  if (input.features.includes('documents') || input.features.includes('support')) considerations.push('Agree on data access, retention, accuracy checks, and a human escalation path before an AI pilot.');
  const questions = [input.stage === 'existing' ? 'What tools are in use today, and what access or documentation can be shared?' : 'Who is the first user, and how do they solve this problem today?', 'What single result would make the first release a success?'];
  if (input.features.includes('integration') || input.features.includes('crm')) questions.push('Which systems must connect, and are their APIs and test environments available?');
  if (input.timing === 'soon') questions.push('What drives the deadline, and which features can wait?');
  questions.push('Who will approve decisions and own the system after launch?');
  return {version:'1.0',createdAt:now.toISOString(),service:service.name,rationale:service.reason,
    goal:goals.find(g=>g.id===input.goal)!.title,focus,
    stage:stages.find(x=>x.id===input.stage)!.label,budget:budgets.find(x=>x.id===input.budget)!.label,timing:timings.find(x=>x.id===input.timing)!.label,context:input.context,
    approach:input.features.length>=4 || input.timing==='soon' || input.budget==='under1' ? 'A focused pilot, then a phased rollout' : input.goal==='explore' ? 'Discovery before a build commitment' : 'Validate, build, and measure',
    phases:[{name:'Discover & define',detail:service.first},{name:'Prototype & implement',detail:service.build},{name:'Validate & evolve',detail:service.measure}],
    questions,acceptance:[service.measure,'Confirm keyboard access, responsive layouts, and clear recovery from errors.','Document setup, ownership, and the agreed launch checklist.'],considerations};
}
export function formatBrief(b: Blueprint): string {
  return ['CYNBIT / PROJECT BLUEPRINT',`Generated: ${b.createdAt.slice(0,10)} · Rules v${b.version}`,'',`GOAL: ${b.goal}`,`RECOMMENDED PATH: ${b.service}`,b.rationale,'',`STARTING POINT: ${b.stage}`,`FOCUS: ${b.focus.join(', ')}`,`BUDGET PREFERENCE: ${b.budget}`,`TIMING PREFERENCE: ${b.timing}`,b.context ? `CONTEXT: ${b.context}` : '','',`APPROACH: ${b.approach}`,...b.phases.map((p,i)=>`${i+1}. ${p.name}: ${p.detail}`),'','DISCOVERY QUESTIONS',...b.questions.map(q=>`- ${q}`),'','ACCEPTANCE CRITERIA',...b.acceptance.map(q=>`- ${q}`),'','CONSIDERATIONS',...b.considerations.map(q=>`- ${q}`),'','Assessment prototype. This brief has not been sent to Cynbit.','Contact: opportunities@cynbit.in | https://www.cynbit.in/contact'].join('\n');
}
