# ElectPath System Architecture

## 1. Architecture Overview
ElectPath utilizes an Agentic Micro-Architecture, delegating specific domain responsibilities to specialized AI systems to ensure modularity, integrity, and non-partisan compliance.

## 2. Specialized Agent Roles & Communication Protocols
The system is orchestrated by the Lead Software Architect (Master Orchestrator), coordinating three specialized agents:

- **Navigator Agent:** Manages the state-machine logic. It handles the progressive disclosure of the "Interactive Election Timeline". It dictates which stage (Registration → Campaign → Voting → Results) is active and evaluates module completion status before unlocking subsequent stages.
- **Verifier Agent:** Establish a strict protocol for data integrity. The gatekeeper of data integrity. It cross-references all election facts against an approved whitelist of official government and election commission sources. If a data point cannot be verified to be bias-free, it is rejected.
- **Visualization Agent:** The frontend implementer. It translates the verified data and state logic into a responsive, accessible (WCAG-compliant) UI using React, Tailwind CSS, and Framer Motion for smooth transitions.

### Communication Protocol
The agents operate using a decoupled message-passing protocol to ensure immutability of verified facts:

1. **State Request:** *Visualization Agent* requests the active state from the *Navigator Agent*.
2. **Data Pipeline:** *Navigator Agent* evaluates the current step in the election cycle and requests the corresponding domain content from the *Verifier Agent*.
3. **Fact Validation Check:** *Verifier Agent* sanitizes and verifies the requested payload against internal schemas and external government APIs/sources, then returns a signed, bias-free payload.
4. **Rendering Generation:** *Navigator Agent* updates the user session state and forwards the newly verified payload to the *Visualization Agent* to render the DOM.

## 3. Database & JSON Schema (Modular Design)
To handle the extensibility required across varying regional and state election laws, the domain model is strictly schema-driven. This prevents hardcoding assumptions into the UI.

```json
{
  "regionId": "US-CA",
  "electionType": "General",
  "lastUpdated": "2024-04-20T10:00:00Z",
  "cycleStages": [
    {
      "stageId": "registration",
      "title": "Voter Registration",
      "status": "unlocked",
      "mandatoryDeadlines": [
        {
          "type": "online",
          "date": "2024-10-21T23:59:59Z",
          "verifiedSource": "https://registertovote.ca.gov"
        }
      ],
      "requirements": ["Age 18+", "Citizen", "Resident"],
      "verificationChecksPassed": true
    },
    {
      "stageId": "voting",
      "title": "Casting Your Ballot",
      "status": "locked",
      "requiresID": false,
      "methods": [
        "In-Person",
        "Mail-In"
      ]
    }
  ]
}
```
This structure allows the `Navigator Agent` to easily restrict access to `stageId: "voting"` until the user successfully completes the learning checks in `stageId: "registration"`.
