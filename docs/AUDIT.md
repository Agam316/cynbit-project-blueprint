# Read-only audit — November 2, 2026 (IST)

Inspected the live homepage, `/services`, and `/contact` through rendered Chrome and fetched HTML/CSS. Reviewed the user-supplied assessment PDF as task context. The PDF's submission instructions were not treated as authorization to submit work, log in to the candidate portal, or contact Cynbit.

## Verified observations

| Observation | Evidence | User / business consequence |
| --- | --- | --- |
| The homepage's discovery CTAs link to `/contact`. | Rendered anchor destinations on [homepage](https://www.cynbit.in/) | A valuable conversion path ends at a generic inquiry form. |
| The form has five fields: full name, email, optional company, optional industry, and message. Name, email, and message are required. | Rendered input properties on [contact](https://www.cynbit.in/contact) | A prospective client must describe the project from scratch before getting a useful direction. |
| No structured goal, scope, budget, or timing input is offered in that form. | Rendered form inspection | Service qualification depends on free text and later follow-up. |
| None of the five form controls had an associated HTML label (`element.labels` was empty). | Browser DOM inspection; also checked accessible-name attributes | Visible labels alone do not give equivalent navigation to assistive-technology users. |
| The service catalog spans automation, software/cloud work, and digital growth. | [Services](https://www.cynbit.in/services) | Nontechnical visitors need help expressing an outcome before picking a solution. |
| Branding uses `#006067`, `#f7fafa`, `#181c1d`, `#ffddb3`, Manrope body text, and Plus Jakarta Sans headings. | Public stylesheets and computed styles | A new feature can integrate without a rebrand. |

No real inquiry was submitted. Internal source, analytics, conversion data, CRM behavior, and the existing form's delivery backend were unavailable. Performance conclusions are limited to measured prototype results; no baseline speed improvement is asserted.

## Alternatives considered

| Candidate | Assessment |
| --- | --- |
| Guided Project Blueprint | Chosen: directly supports the main discovery CTA, helps uncertain visitors, and produces a useful artifact. Bounded, testable rules; no external service cost. |
| Generic chatbot | Adds maintenance and answer-quality risk without a verified need for open-ended conversation. A guided path is sufficient. |
| Site-wide performance work | Potentially valuable, but no production source or field measurements were available. A prototype would not prove an improvement to the existing deployment. |
| Visual refresh / animations | Weak functional value and unnecessary brand disruption. |
| Accessibility-only form repair | Clearly justified and included within the selected journey; by itself, a smaller assessment scope. |

## Acceptance criteria

- A visitor can generate a coherent brief without signing up or providing identity details.
- Every service path has relevant focus areas and explainable recommendations.
- Changing a goal removes incompatible selections; going back preserves compatible answers.
- Invalid or failed requests never display success or erase a draft.
- The complete brief can leave the browser through text download, copy, print, or an explicit email draft.
- Mobile layouts, keyboard interaction, form labels, and error messages are verified.
- Original brand assets are attributed; no invented client metrics, prices, or delivery promises are displayed.
