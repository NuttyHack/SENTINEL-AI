import { Router, type IRouter } from "express";
import {
  AskInvestigationAssistantBody,
  AskInvestigationAssistantResponse,
  CreateInvestigationBody,
  CreateInvestigationResponse,
  CreateReportBody,
  CreateReportResponse,
  GetDashboardResponse,
  GetIssueParams,
  GetIssueResponse,
  GetVehicleParams,
  GetVehicleResponse,
  ListIssuesQueryParams,
  ListIssuesResponse,
  ListVehiclesQueryParams,
  ListVehiclesResponse,
  ListInvestigationsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const issues = [
  {
    id: "ISS-2407",
    title: "Cooling System Anomaly",
    component: "Thermal management",
    severity: "CRITICAL",
    status: "HIGH PRIORITY",
    riskScore: 91,
    confidence: 92,
    affectedVehicles: 184000,
    exposure: 48.6,
    detectedDaysAgo: 47,
    signal: "Coolant pressure drift after 30,000 km",
    owner: "Maya Chen",
  },
  {
    id: "ISS-2399",
    title: "Infotainment Restart Pattern",
    component: "Connected cockpit",
    severity: "HIGH",
    status: "INVESTIGATING",
    riskScore: 78,
    confidence: 88,
    affectedVehicles: 62000,
    exposure: 12.4,
    detectedDaysAgo: 19,
    signal: "Restart events cluster around software 4.8.2",
    owner: "Jon Bell",
  },
  {
    id: "ISS-2384",
    title: "Steering Assist Voltage Drift",
    component: "Electric steering",
    severity: "MEDIUM",
    status: "ENGINEERING REVIEW",
    riskScore: 64,
    confidence: 81,
    affectedVehicles: 27800,
    exposure: 6.9,
    detectedDaysAgo: 11,
    signal: "Voltage variance in high-temperature regions",
    owner: "Sofia Patel",
  },
  {
    id: "ISS-2371",
    title: "Door Latch Diagnostic Noise",
    component: "Body electronics",
    severity: "LOW",
    status: "NEW",
    riskScore: 42,
    confidence: 73,
    affectedVehicles: 9300,
    exposure: 1.3,
    detectedDaysAgo: 4,
    signal: "Intermittent diagnostic events in batch B-17",
    owner: "Unassigned",
  },
];

const vehicles = [
  {
    id: "SNT-00018472",
    model: "Apex GT",
    modelYear: 2024,
    plant: "Monterrey",
    region: "North America",
    mileage: 32840,
    software: "4.8.2",
    riskScore: 87,
    riskLevel: "HIGH",
    failureProbability: 78,
    primaryFactor: "Thermal component age",
  },
  {
    id: "SNT-00093104",
    model: "Vela X",
    modelYear: 2023,
    plant: "Valencia",
    region: "Europe",
    mileage: 41720,
    software: "4.8.2",
    riskScore: 82,
    riskLevel: "HIGH",
    failureProbability: 69,
    primaryFactor: "Software interaction",
  },
  {
    id: "SNT-00142776",
    model: "Northstar EV",
    modelYear: 2024,
    plant: "Gwangju",
    region: "Asia Pacific",
    mileage: 29110,
    software: "4.7.9",
    riskScore: 63,
    riskLevel: "MEDIUM",
    failureProbability: 41,
    primaryFactor: "Environmental exposure",
  },
  {
    id: "SNT-00044218",
    model: "Vela X",
    modelYear: 2022,
    plant: "Monterrey",
    region: "North America",
    mileage: 52180,
    software: "4.8.1",
    riskScore: 58,
    riskLevel: "MEDIUM",
    failureProbability: 34,
    primaryFactor: "Mileage",
  },
  {
    id: "SNT-00188291",
    model: "Apex GT",
    modelYear: 2025,
    plant: "Valencia",
    region: "Europe",
    mileage: 8700,
    software: "4.9.0",
    riskScore: 18,
    riskLevel: "LOW",
    failureProbability: 9,
    primaryFactor: "No elevated factors",
  },
];

const investigations = [
  {
    id: "INV-1042",
    issueId: "ISS-2407",
    title: "Cooling System Anomaly",
    status: "HIGH PRIORITY",
    severity: "CRITICAL",
    investigator: "Maya Chen",
    updatedAt: "12 min ago",
  },
  {
    id: "INV-1038",
    issueId: "ISS-2399",
    title: "Infotainment Restart Pattern",
    status: "INVESTIGATING",
    severity: "HIGH",
    investigator: "Jon Bell",
    updatedAt: "2 hr ago",
  },
  {
    id: "INV-1031",
    issueId: "ISS-2384",
    title: "Steering Assist Voltage Drift",
    status: "ENGINEERING REVIEW",
    severity: "MEDIUM",
    investigator: "Sofia Patel",
    updatedAt: "Yesterday",
  },
];

const issueDetail = {
  issue: issues[0],
  hypotheses: [
    {
      id: "H-1",
      title: "Component degradation",
      probability: 67,
      category: "MODEL HYPOTHESIS",
      evidence: [
        "Failure rate rises 3.4× after 30,000 km in batch TB-22",
        "Thermal cycling is 2.1× higher in affected vehicles",
        "Supplier lot alignment is statistically significant (p < 0.01)",
      ],
    },
    {
      id: "H-2",
      title: "Software interaction",
      probability: 21,
      category: "MODEL HYPOTHESIS",
      evidence: [
        "Software 4.8.2 appears in 61% of affected vehicles",
        "No matching change-point in the diagnostic event stream",
      ],
    },
    {
      id: "H-3",
      title: "Environmental factor",
      probability: 12,
      category: "MODEL HYPOTHESIS",
      evidence: [
        "High-temperature regions show a 1.6× incidence lift",
        "The pattern persists after controlling for plant and model year",
      ],
    },
  ],
  timeline: [
    { label: "First weak signal", detail: "Warranty claims begin diverging from baseline", date: "18 Jun", kind: "signal" },
    { label: "Anomaly detected", detail: "Sentinel crosses statistical change-point threshold", date: "24 Jun", kind: "detected" },
    { label: "Risk increased", detail: "Risk score moved from 64 to 91", date: "03 Jul", kind: "risk" },
    { label: "Investigation triggered", detail: "Engineering review opened by quality control", date: "08 Jul", kind: "investigation" },
    { label: "Potential intervention point", detail: "Current estimate, subject to validation", date: "Now", kind: "intervention" },
    { label: "Potential failure threshold", detail: "Projected if signal is not addressed", date: "21 Aug", kind: "threshold" },
  ],
  graph: [
    { id: "supplier", label: "Supplier", value: "ThermaCore", kind: "supplier" },
    { id: "batch", label: "Component batch", value: "TB-22", kind: "batch" },
    { id: "component", label: "Vehicle component", value: "Coolant pump", kind: "component" },
    { id: "software", label: "Software version", value: "4.8.2", kind: "software" },
    { id: "signal", label: "Diagnostic signal", value: "Pressure drift", kind: "signal" },
    { id: "claim", label: "Warranty claim", value: "Cooling performance", kind: "claim" },
    { id: "failure", label: "Failure", value: "Thermal protection", kind: "failure" },
  ],
  impactedModels: [
    { label: "Apex GT", value: 78 },
    { label: "Vela X", value: 64 },
    { label: "Northstar EV", value: 39 },
    { label: "Orion Sport", value: 24 },
  ],
  impactedPlants: [
    { label: "Monterrey", value: 82 },
    { label: "Valencia", value: 51 },
    { label: "Gwangju", value: 34 },
    { label: "Brno", value: 18 },
  ],
  simulator: {
    affectedVehicles: 184000,
    failureProbability: 78,
    repairCost: 420,
    partsCost: 180,
    laborCost: 240,
    compensation: 95,
    lateExposure: 48.6,
    earlyExposure: 11.2,
  },
};

const dashboard = {
  qualityHealth: 82,
  activeIssues: 14,
  criticalIssues: 3,
  recallRisks: 2,
  affectedVehicles: 284600,
  financialExposure: 68.4,
  leadTimeDays: 47,
  confidence: 91,
  resolvedIssues: 38,
  trend: [
    { label: "Mar", value: 28 },
    { label: "Apr", value: 34 },
    { label: "May", value: 31 },
    { label: "Jun", value: 47 },
    { label: "Jul", value: 62 },
    { label: "Aug", value: 71 },
  ],
  modelRates: [
    { label: "Apex GT", value: 4.8 },
    { label: "Vela X", value: 3.7 },
    { label: "Northstar EV", value: 2.9 },
    { label: "Orion Sport", value: 1.8 },
  ],
  componentRates: [
    { label: "Thermal", value: 6.4 },
    { label: "Cockpit", value: 4.1 },
    { label: "Steering", value: 2.8 },
    { label: "Body", value: 1.7 },
  ],
  regions: [
    { region: "North America", score: 74, affected: 128400 },
    { region: "Europe", score: 61, affected: 89400 },
    { region: "Asia Pacific", score: 48, affected: 53600 },
    { region: "South America", score: 29, affected: 13200 },
  ],
  activity: [
    { id: "a1", title: "Cooling System Anomaly escalated", detail: "Risk score moved to critical", time: "12 min ago", type: "critical" },
    { id: "a2", title: "New weak signal detected", detail: "Door Latch Diagnostic Noise", time: "47 min ago", type: "signal" },
    { id: "a3", title: "Investigation evidence added", detail: "Infotainment Restart Pattern", time: "2 hr ago", type: "evidence" },
    { id: "a4", title: "Issue resolved", detail: "Brake pad wear variance", time: "Yesterday", type: "resolved" },
  ],
};

function parseId(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

router.get("/dashboard", (_req, res): void => {
  res.json(GetDashboardResponse.parse(dashboard));
});

router.get("/issues", (req, res): void => {
  const parsed = ListIssuesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, severity } = parsed.data;
  const filtered = issues.filter(
    (issue) =>
      (!status || issue.status.toLowerCase() === status.toLowerCase()) &&
      (!severity || issue.severity.toLowerCase() === severity.toLowerCase()),
  );
  res.json(ListIssuesResponse.parse(filtered));
});

router.get("/issues/:id", (req, res): void => {
  const params = GetIssueParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (params.data.id !== issueDetail.issue.id) {
    const found = issues.find((issue) => issue.id === params.data.id);
    if (!found) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.json(GetIssueResponse.parse({ ...issueDetail, issue: found }));
    return;
  }
  res.json(GetIssueResponse.parse(issueDetail));
});

router.get("/vehicles", (req, res): void => {
  const parsed = ListVehiclesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const search = parsed.data.search?.toLowerCase();
  const filtered = search
    ? vehicles.filter((vehicle) =>
        [vehicle.id, vehicle.model, vehicle.plant, vehicle.software]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
    : vehicles;
  res.json(ListVehiclesResponse.parse(filtered));
});

router.get("/vehicles/:id", (req, res): void => {
  const params = GetVehicleParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const vehicle = vehicles.find((item) => item.id === params.data.id);
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(
    GetVehicleResponse.parse({
      vehicle,
      factors: [
        { label: "Component age", contribution: 38, detail: "Coolant pump crossed the 30,000 km degradation band" },
        { label: "Mileage", contribution: 24, detail: "Vehicle is 6% above the cohort median" },
        { label: "Software version", contribution: 18, detail: "4.8.2 appears in the leading issue cohort" },
        { label: "Environmental exposure", contribution: 12, detail: "High-temperature route profile detected" },
        { label: "Historical pattern", contribution: 8, detail: "Prior diagnostic events match 3 of 5 known precursors" },
      ],
      events: [
        { id: "e1", title: "Risk score recalculated", detail: "Model confidence increased to 92%", time: "12 min ago", type: "model" },
        { id: "e2", title: "Diagnostic event received", detail: "Coolant pressure drift", time: "Yesterday", type: "diagnostic" },
        { id: "e3", title: "Warranty claim matched", detail: "Thermal management / intermittent", time: "06 Aug", type: "claim" },
      ],
    }),
  );
});

router.get("/investigations", (_req, res): void => {
  res.json(ListInvestigationsResponse.parse(investigations));
});

router.post("/investigations", (req, res): void => {
  const parsed = CreateInvestigationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const issue = issues.find((item) => item.id === parsed.data.issueId);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  const created = {
    id: `INV-${1050 + investigations.length}`,
    issueId: issue.id,
    title: issue.title,
    status: "INVESTIGATING",
    severity: issue.severity,
    investigator: parsed.data.investigator,
    updatedAt: "Just now",
  };
  investigations.unshift(created);
  res.status(201).json(CreateInvestigationResponse.parse(created));
});

router.post("/ai/investigate", (req, res): void => {
  const parsed = AskInvestigationAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const question = parsed.data.question.toLowerCase();
  let answer =
    "The current evidence points to component degradation as the leading hypothesis. The strongest signal is the 3.4× failure-rate lift after 30,000 km in supplier batch TB-22, with a statistically significant lot alignment.";
  let confidence = 91;
  let sources = ["Warranty claims: 18,420 records", "Component batch analysis: TB-22", "Diagnostic stream: 2.1M events"];
  if (question.includes("model") || question.includes("vehicle")) {
    answer = "Apex GT is the most affected model at a 4.8% failure rate, followed by Vela X at 3.7%. Together they represent 72% of the affected population in this synthetic cohort.";
    confidence = 89;
    sources = ["Model cohort comparison", "Vehicle population: 184,000"];
  } else if (question.includes("when") || question.includes("first")) {
    answer = "The first weak signal appeared 47 days ago, when warranty claims began diverging from baseline. Sentinel crossed its change-point threshold six days later.";
    confidence = 94;
    sources = ["Warranty trend baseline", "Change-point detection"];
  } else if (question.includes("software") || question.includes("4.8")) {
    answer = "Software 4.8.2 is present in 61% of affected vehicles, but the current evidence does not establish causation. The software interaction hypothesis remains secondary at 21%.";
    confidence = 84;
    sources = ["Software-version correlation", "Hypothesis ranking"];
  } else if (question.includes("additional") || question.includes("confirm")) {
    answer = "The highest-value next data would be teardown results for TB-22 pumps, coolant chemistry by climate zone, and a controlled comparison of vehicles on software 4.8.2 versus 4.8.1.";
    confidence = 87;
    sources = ["Evidence gap analysis", "Leading hypothesis: component degradation"];
  }
  res.json(AskInvestigationAssistantResponse.parse({ answer, confidence, sources }));
});

router.post("/reports", (req, res): void => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const issue = issues.find((item) => item.id === parsed.data.issueId);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  const report = {
    id: `RPT-${Date.now().toString().slice(-6)}`,
    issueId: issue.id,
    title: `${issue.title} — Executive Investigation Report`,
    generatedAt: new Date().toISOString(),
    sections: [
      "Executive Summary",
      "Issue Description",
      "Detection Timeline",
      "Affected Population",
      "Statistical Evidence",
      "AI Hypotheses",
      "Root-Cause Candidates",
      "Risk Assessment",
      "Potential Business Exposure",
      "Recommended Next Steps",
      "Data Limitations",
      "Confidence Level",
    ],
  };
  res.status(201).json(CreateReportResponse.parse(report));
});

export default router;