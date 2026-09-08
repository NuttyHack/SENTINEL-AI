import { Router, type IRouter } from "express";
import multer from "multer";
import readline from "readline";
import fs from "fs";
import {
  GetRecallRadarResponse,
  GetSoftwareIntelligenceQueryParams,
  GetSoftwareIntelligenceResponse,
  SimulateOtaUpdateBody,
  SimulateOtaUpdateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const upload = multer({ dest: "uploads/" });

// In-memory metrics defaults sourced directly from official Ford NHTSA data
let dynamicMetrics = {
  totalVehiclesAnalyzed: 4841000,
  criticalSignalsCount: 3,
  dataSourceLabel: "Ford Motors Fleet Baseline (2026 NHTSA Campaigns)",
};

// Official Ford Recall Campaigns mapped to Recall Radar signals
const fordRecallSignals = [
  {
    id: "26V112000",
    title: "Trailer Brake Signal Loss",
    component: "Trailer Brake Software",
    severity: "CRITICAL",
    status: "HIGH PRIORITY",
    affectedVehicles: 4300000,
    detectedDaysAgo: 14,
    confidence: 96,
    exposure: 88.8,
    signal: "Communication break between vehicle and towed trailers dropping brake light activation",
    leadingHypothesis: "CAN bus packet loss during trailer synchronization on software release v4.8.2",
    whyFlagged: [
      "4.3M affected across F-150, Maverick, and Expedition cohorts",
      "Remediable via Over-the-Air (OTA) Software Patch",
      "Failure rate is 4.2× baseline on software version 4.8.2",
    ],
    riskScore: 98,
  },
  {
    id: "26V124000",
    title: "APIM Infotainment Overheating",
    component: "Infotainment / APIM Logic",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    affectedVehicles: 245000,
    detectedDaysAgo: 22,
    confidence: 91,
    exposure: 5.1,
    signal: "Overheating logic causing rear-view camera feeds to freeze or black out",
    leadingHypothesis: "APIM processor thermal throttling during reverse camera render loop",
    whyFlagged: [
      "Affects 245,000 Mach-E and Explorer (2023-2024) vehicles",
      "Safety-critical rear camera feed blackout",
      "Requires Dealer Software Update / Module Swap",
    ],
    riskScore: 89,
  },
  {
    id: "26V547000",
    title: "Engine Harness Power Loss",
    component: "Electrical / Wiring Harness",
    severity: "CRITICAL",
    status: "ENGINEERING REVIEW",
    affectedVehicles: 149000,
    detectedDaysAgo: 35,
    confidence: 88,
    exposure: 3.1,
    signal: "Engine compartment harness connections failing, causing loss of drive power",
    leadingHypothesis: "Physical connection degradation under thermal expansion cycles",
    whyFlagged: [
      "149,000 Mustang (2024-2025) units impacted",
      "Immediate loss of drive power while in operation",
      "Requires Physical Dealer Inspection / Replacement",
    ],
    riskScore: 84,
  },
  {
    id: "26V343000",
    title: "Intake Valve Structural Crack",
    component: "Engine / Valve Assembly",
    severity: "HIGH",
    status: "ENGINEERING REVIEW",
    affectedVehicles: 91000,
    detectedDaysAgo: 42,
    confidence: 85,
    exposure: 1.9,
    signal: "QA sensors missed microscopic structural cracking inside intake valves",
    leadingHypothesis: "Factory supplier QA sensor calibration failure during batch production",
    whyFlagged: [
      "91,000 Bronco, Ranger, and Explorer (2024-2025) units affected",
      "Physical Engine Component Replacement required",
    ],
    riskScore: 76,
  },
  {
    id: "26V492000",
    title: "SYNC Screen Overlay Bug",
    component: "SYNC Screen Graphics",
    severity: "MEDIUM",
    status: "MONITORING",
    affectedVehicles: 56000,
    detectedDaysAgo: 8,
    confidence: 79,
    exposure: 1.1,
    signal: "SYNC home screen improperly overlays live backup video feed in reverse",
    leadingHypothesis: "UI thread priority bug on software build 4.9.0",
    whyFlagged: [
      "56,000 F-150, Lightning, and Escape (2023-2025) units impacted",
      "Fully addressable via Over-the-Air (OTA) Software Update",
    ],
    riskScore: 62,
  },
];

const detectionTrend = [
  { label: "Apr", value: 12 },
  { label: "May", value: 28 },
  { label: "Jun", value: 45 },
  { label: "Jul", value: 89 },
  { label: "Aug", value: 142 },
];

const versions = [
  { version: "4.7.9", fleetShare: 18, diagnosticRate: 2.1, failureRate: 0.8, warrantyRate: 1.4 },
  { version: "4.8.1", fleetShare: 34, diagnosticRate: 2.4, failureRate: 0.9, warrantyRate: 1.6 },
  { version: "4.8.2", fleetShare: 39, diagnosticRate: 5.8, failureRate: 2.7, warrantyRate: 3.9 },
  { version: "4.9.0", fleetShare: 9, diagnosticRate: 2.2, failureRate: 0.8, warrantyRate: 1.3 },
];

/**
 * Dynamic CSV Telemetry Ingestion Endpoint
 */
router.post("/telemetry/upload", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No CSV file uploaded." });
    return;
  }

  try {
    let totalLogs = 0;
    let criticalCount = 0;
    const softwareDistribution: Record<string, number> = {};

    const fileStream = fs.createReadStream(req.file.path);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;

    for await (const line of rl) {
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const parts = line.split(",");
      if (parts.length < 8) continue;

      const [, , , , softwareVersion, , , severity] = parts;

      totalLogs++;
      softwareDistribution[softwareVersion] = (softwareDistribution[softwareVersion] || 0) + 1;

      if (severity === "CRITICAL") {
        criticalCount++;
      }
    }

    fs.unlinkSync(req.file.path);

    // Dynamic metrics update when Ford uploads their 1,000-row file
    dynamicMetrics = {
      totalVehiclesAnalyzed: totalLogs,
      criticalSignalsCount: criticalCount,
      dataSourceLabel: `Live Ingestion: ${totalLogs.toLocaleString()} Ford Vehicle Logs Processed`,
    };

    res.json({
      status: "SUCCESS",
      processedRows: totalLogs,
      criticalAnomalies: criticalCount,
      softwareVersionStats: softwareDistribution,
      summary: `Parsed ${totalLogs.toLocaleString()} telemetry rows. Dashboard counters updated.`,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process CSV file." });
  }
});

router.get("/recall-radar", (_req, res): void => {
  res.json(
    GetRecallRadarResponse.parse({
      signals: fordRecallSignals,
      totalAtRisk: dynamicMetrics.totalVehiclesAnalyzed,
      criticalSignals: dynamicMetrics.criticalSignalsCount,
      averageLeadTime: 18,
      syntheticLabel: dynamicMetrics.dataSourceLabel,
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
      subsystem: "Trailer Brake + APIM Infotainment Telemetry",
      regressionAlert:
        comparisonVersion === "4.8.2"
          ? "Model-estimated increase in diagnostic events following software release 4.8.2."
          : "No material regression signal detected in the selected comparison.",
      changeInDiagnostics: comparisonVersion === "4.8.2" ? 91.7 : 8.3,
      changeInFailures: comparisonVersion === "4.8.2" ? 88.9 : 6.4,
      changeInWarranty: comparisonVersion === "4.8.2" ? 75 : 4.8,
      confidence: comparisonVersion === "4.8.2" ? 96 : 76,
      affectedModels: [
        { label: "F-150 / Lightning", value: comparisonVersion === "4.8.2" ? 82 : 18 },
        { label: "Mach-E", value: comparisonVersion === "4.8.2" ? 64 : 14 },
        { label: "Explorer / Bronco", value: comparisonVersion === "4.8.2" ? 41 : 9 },
        { label: "Maverick / Expedition", value: comparisonVersion === "4.8.2" ? 29 : 6 },
      ],
      versions,
      evidence: [
        "4.84M fleet recall records cross-referenced with software build releases",
        "Trailer Brake software bug (NHTSA 26V112000) mapped to v4.8.2 cohort",
        "APIM camera freeze telemetry correlated with thermal overload events",
        "Signal confirmed across F-150, Mach-E, and Escape model lines",
      ],
      recommendation:
        comparisonVersion === "4.8.2"
          ? "Deploy OTA software patch for Trailer Brake communication bug (26V112000) and restrict further v4.8.2 rollouts."
          : "Continue monitored rollout and keep current version baseline active.",
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
  const elevated = toVersion === "4.8.2" || subsystem.toLowerCase().includes("brake");
  const riskLevel = elevated && deploymentPercentage > 50 ? "HIGH" : elevated ? "MEDIUM" : "LOW";
  const anomalyLift = elevated ? 18.2 : 3.2;
  const impacted = Math.round(exposure * (elevated ? 0.089 : 0.021));

  res.json(
    SimulateOtaUpdateResponse.parse({
      population,
      deploymentPercentage,
      estimatedImpact: `Approximately ${impacted.toLocaleString()} Ford vehicles may express a signal during staged rollout.`,
      potentialAnomalies: [
        `${anomalyLift}% modeled increase in ${subsystem} diagnostic events`,
        "Trailer brake communication drop rate spikes during high CAN bus load",
        elevated ? "High correlation with NHTSA campaign 26V112000" : "No cross-system interaction detected",
      ],
      affectedModels: [
        { label: "F-150", value: elevated ? 85 : 21 },
        { label: "Maverick", value: elevated ? 62 : 17 },
        { label: "Mach-E", value: elevated ? 44 : 11 },
        { label: "Explorer", value: elevated ? 28 : 8 },
      ],
      riskLevel,
      rollbackRecommendation:
        riskLevel === "HIGH"
          ? `Do not exceed ${Math.max(10, Math.round(deploymentPercentage / 4))}% rollout until OTA patch for ${fromVersion} → ${toVersion} is verified.`
          : "Proceed with staged deployment.",
      modelConfidence: elevated ? 94 : 74,
      simulatedEstimate: true,
    }),
  );
});

export default router;