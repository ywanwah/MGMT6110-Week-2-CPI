# PROMPTS.md - [AI Prompt Log: Singapore CPI Dashboard Integration]
**Student:** [Jo Yeong Wan Wah] · **Course:** MGMT 6110 · **Problem Set 2**
**User sentence:** A user opens this screen to the Singapore CPI Dashboard Intregration, and knows it worked when they see a fully dynamic, real-time chart or metric displaying the latest Singapore Consumer Price Index (CPI) data fetched from the official SingStat API, alongside a clear attribution footnote in the footer, without any hardcoded mock data.
**Live link:** https://mgmt-6110-week-2-cpi-8ix1.vercel.app/
# 

## 1. Initial System Prompt
**Intent:** Establish the serverless project architecture, error guardrails, and Vercel environment constraints.

```text
[Pasted the full initial prompt here: "ROLE: You are a senior full-stack developer... CONTEXT: Deployed on Vercel from GitHub..."]
```
**Outcome:** The AI generated the initial structure for `api/cpi.js` and `api/health.js`, and advised setting up the `SINGSTAT_API_KEY` environment variable.

---
## 2. Failed Prompts & Debugging Cycles

### Cycle A: Environment Variable & Vercel Prefix Clarification
*   **Intent:** Identify the correct environment variable naming strategy to pass the prompt's backend guardrail.
*   **Context:** The SingStat Table Builder API is publicly accessible, but the prompt mandates an upstream credential check to protect project architecture. 
*   **Debugging Query:** *“What is the Environment Variable in Vercel for the above prompts?”*
*   **Outcome:** Established `SINGSTAT_API_KEY` as a required Vercel environment variable using placeholder content (`public_access`). The AI highlighted a critical security risk: **never prefix the variable with `VITE_`** (`VITE_SINGSTAT_API_KEY`), as doing so forces Vite to compile the variable directly into the client-side browser bundle, violating the strict backend isolation guardrail.

### Cycle B: HTML Response Parsing Failure
*   **Intent:** Resolve the network failure crash when the upstream server goes down.
*   **The Error Encountered:**
    ```text
    The SingStat service is currently unreachable due to a network connection failure.
    Unexpected token '<', "<!doctype "... is not valid JSON
    ```
*   **Debugging Query:** *“I am getting an error when testing: 'Unexpected token '<', "<!doctype "... is not valid JSON'. The SingStat service is failing or returning an HTML error page. Update the serverless functions to handle this without crashing.”*
*   **Outcome:** The AI updated the route logic by adding an explicit check for `response.ok` before parsing `.json()`, successfully intercepting the HTML error payload and transforming it into a clean `502 Upstream Unreachable` JSON payload.

---
## 3. Manual Refinements (Hand-Coding)
*   **Timestamp/Phase:** Post-generation cleanup.
*   **Action Taken:** Manually verified that the environment variable checking block in `api/cpi.js` correctly evaluates both missing values and the string literal `"undefined"` to align perfectly with Vercel's preview deployment behavior.

---
## 4. Embed Disqus for comments
ROLE: You are a front-end developer working in my existing project. Add to it; do not
rewrite what is already there.

GOAL: Add a Disqus comment section to the bottom of my main page only, so that visitors
can leave feedback on the product in a single thread.

CONTEXT:
- My Disqus shortname is: jojo-phronesis
- My live address is: https://mgmt-6110-week-2-cpi.vercel.app/

OUTPUT: A small component on the main page that loads the Disqus Universal Code once, with
page.url set to my full live address (https, and no query string) and page.identifier set
to the fixed string "home". Put one short line above it inviting visitors to say what
worked for them and what did not.

GUARDRAILS: Load the Disqus script only once, even when the component re-renders. Mount it
on the main page only, so that every comment lands in one thread. Do not change anything
else on the page, and add no npm package without telling me why one is needed.

---
## 5. Embed Microsoft Clarity to see what visitors do
ROLE: You are a front-end developer working in my existing project.

GOAL: Add Microsoft Clarity to my product, together with a privacy notice that covers both
Microsoft Clarity and Disqus.

CONTEXT:
- My live address is: https://mgmt-6110-week-2-cpi.vercel.app/
- Clarity gave me this tracking code:
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ymuz5nu3bi");
</script>

OUTPUT:
1) Add the tracking code to the head of index.html, wrapped so that it runs only when
   window.location.hostname is exactly my live address's hostname. Keep the project ID
   inside the code exactly as Clarity provided it.
2) Add this notice to the footer of every page, with the three links working:
   "This page uses Microsoft Clarity and Disqus, which use cookies to record how visitors
   use the site and to host comments. By using this page you agree that we and Microsoft
   may collect and use this data. See the Microsoft Privacy Statement
   (https://www.microsoft.com/privacy/privacystatement), the Disqus privacy policy
   (https://disqus.com/privacy-policy/) and the Disqus data sharing settings
   (https://disqus.com/data-sharing-settings/)."

GUARDRAILS: Do not edit the project ID. Do not load the tracking code twice. Do not
change anything else on the page.

---
