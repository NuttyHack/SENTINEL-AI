import { Router, type IRouter } from "express";
import {
  GetRecallRadarResponse,
  GetSoftwareIntelligenceQueryParams,
  GetSoftwareIntelligenceResponse,
  SimulateOtaUpdateBody,
  SimulateOtaUpdateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const recallSignals = [
  {
    id: "ISS-2407",
    title: "Cooling System Anomaly",
    component: "Thermal management",
    severity: "CRITICAL",
    status: "HIGH PRIORITY",
    affectedVehicles: 184000,
    detectedDaysAgo: 47,
    confidence: 92,
    exposure: 48.6,
    signal: "Coolant pressure drift after 30,000 km",
    leadingHypothesis: "Component degradation in supplier batch TB-22",
    whyFlagged: [
      "Failure rate is 3.4× baseline after 30,000 km",
      "61% of affected vehicles run software 4.8.2",
      "Supplier lot alignment is statistically significant",
    ],
    riskScore: 91,
  },
  {
    id: "ISS-2399",
    title: "Infotainment Restart Pattern",
    component: "Connected cockpit",
    severity: "HIGH",
    status: "INVESTIGATING",
    affectedVehicles: 62000,
    detectedDaysAgo: 19,
    confidence: 88,
    exposure: 12.4,
    signal: "Restart events cluster around software 4.8.2",
    leadingHypothesis: "Software interaction with connected cockpit firmware",
    whyFlagged: [
      "Diagnostic restarts are 2.6× higher on 4.8.2",
      "The same pattern is absent in the 4.8.1 cohort",
      "Warranty descriptions cluster around screen recovery",
    ],
    riskScore: 78,
  },
  {
    id: "ISS-2384",
    title: "Steering Assist Voltage Drift",
    component: "Electric steering",
    severity: "MEDIUM",
    status: "ENGINEERING REVIEW",
    affectedVehicles: 27800,
    detectedDaysAgo: 11,
    confidence: 81,
    exposure: 6.9,
    signal: "Voltage variance in high-temperature environments",
    leadingHypothesis: "Environmental exposure amplifying component variance",
    whyFlagged: [
      "High-temperature regions show a 1.6× incidence lift",
      "The lift persists after controlling for plant and model year",
      "Diagnostic variance precedes warranty activity by 8 days",
    ],
    riskScore: 64,
  },
];

const detectionTrend = [
  { label: "Mar", value: 2 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 8 },
  { label: "Jul", value: 11 },
  { label: "Aug", value: 14 },
];

const versions = [
  { version: "4.7.9", fleetShare: 18, diagnosticRate: 2.1, failureRate: 0.8, warrantyRate: 1.4 },
  { version: "4.8.1", fleetShare: 34, diagnosticRate: 2.4, failureRate: 0.9, warrantyRate: 1.6 },
  { version: "4.8.2", fleetShare: 39, diagnosticRate: 4.6, failureRate: 1.7, warrantyRate: 2.8 },
  { version: "4.9.0", fleetShare: 9, diagnosticRate: 2.2, failureRate: 0.8, warrantyRate: 1.3 },
];

router.get("/recall-radar", (_req, res): void => {
  res.json(
    GetRecallRadarResponse.parse({
      signals: recallSignals,
      totalAtRisk: 273800,
      criticalSignals: 1,
      averageLeadTime: 31,
      syntheticLabel: "Demonstration environment using synthetic data",
      detectionTrend,
    }),
  );
});

router.get("/software-intelligence", (req, res): void => {
  const parsed = GetSoftwareIntelligenceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const baselineVersion = parsed.data.baseline ?? "4.8.1";
  const comparisonVersion = parsed.data.comparison ?? "4.8.2";
  res.json(
    GetSoftwareIntelligenceResponse.parse({
      baselineVersion,
      comparisonVersion,
      subsystem: "Connected cockpit + thermal telemetry",
      regressionAlert:
        comparisonVersion === "4.8.2"
          ? "Model-estimated increase in diagnostic events following software version change."
          : "No material regression signal detected in the selected comparison.",
      changeInDiagnostics: comparisonVersion === "4.8.2" ? 91.7 : 8.3,
      changeInFailures: comparisonVersion === "4.8.2" ? 88.9 : 6.4,
      changeInWarranty: comparisonVersion === "4.8.2" ? 75 : 4.8,
      confidence: comparisonVersion === "4.8.2" ? 89 : 76,
      affectedModels: [
        { label: "Apex GT", value: comparisonVersion === "4.8.2" ? 72 : 18 },
        { label: "Vela X", value: comparisonVersion === "4.8.2" ? 58 : 14 },
        { label: "Northstar EV", value: comparisonVersion === "4.8.2" ? 31 : 9 },
        { label: "Orion Sport", value: comparisonVersion === "4.8.2" ? 19 : 6 },
      ],
      versions,
      evidence: [
        "2.1M simulated diagnostic events normalized by vehicle-month",
        "Warranty claims matched to software version at event time",
        "Cohort comparison controls for model year and manufacturing plant",
        "Signal is correlated, not proof of software causation",
      ],
      recommendation:
        comparisonVersion === "4.8.2"
          ? "Hold broad deployment, isolate cockpit and thermal telemetry interactions, and run a controlled rollback cohort."
          : "Continue monitored rollout and keep the current comparison as a baseline for future change-point detection.",
    }),
  );
});

router.post("/ota-simulator", (req, res): void => {
  const parsed = SimulateOtaUpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { population, fromVersion, toVersion, subsystem, deploymentPercentage } = parsed.data;
  const exposure = population * (deploymentPercentage / 100);
  const elevated = toVersion === "4.8.2" || subsystem.toLowerCase().includes("thermal");
  const riskLevel = elevated && deploymentPercentage > 50 ? "HIGH" : elevated ? "MEDIUM" : "LOW";
  const anomalyLift = elevated ? 14.6 : 3.2;
  const impacted = Math.round(exposure * (elevated ? 0.068 : 0.021));

  res.json(
    SimulateOtaUpdateResponse.parse({
      population,
      deploymentPercentage,
      estimatedImpact: `Approximately ${impacted.toLocaleString()} vehicles may show an elevated ${subsystem} signal at the selected deployment.`,
      potentialAnomalies: [
        `${anomalyLift}% modeled increase in ${subsystem} diagnostic events`,
        "Transient signal concentration in vehicles above 30,000 km",
        elevated ? "Cross-system interaction with the current telemetry baseline" : "No material cross-system interaction detected",
      ],
      affectedModels: [
        { label: "Apex GT", value: elevated ? 72 : 21 },
        { label: "Vela X", value: elevated ? 58 : 17 },
        { label: "Northstar EV", value: elevated ? 34 : 11 },
        { label: "Orion Sport", value: elevated ? 19 : 8 },
      ],
      riskLevel,
      rollbackRecommendation:
        riskLevel === "HIGH"
          ? `Do not exceed ${Math.max(10, Math.round(deploymentPercentage / 4))}% deployment until a controlled cohort confirms the ${fromVersion} → ${toVersion} delta.`
          : "Proceed with staged deployment and retain a monitored rollback cohort.",
      modelConfidence: elevated ? 86 : 74,
      simulatedEstimate: true,
    }),
  );
});

export default router;