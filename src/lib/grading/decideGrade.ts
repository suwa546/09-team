import { GRADING_THRESHOLDS } from "./thresholds";

export type DefectType = "scratch" | "dent" | "crack";
export type Defect = {
  type: DefectType;
  sizeMm: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  severity?: "low" | "medium" | "high";
};

export function decideGrade(defects: Defect[]): "A" | "B" | "C" {
  const hasDentOrCrack = defects.some((defect) => defect.type === "dent" || defect.type === "crack");
  const hasLargeScratch = defects.some((defect) => defect.type === "scratch" && defect.sizeMm > GRADING_THRESHOLDS.largeScratchMm);
  const smallScratchCount = defects.filter((defect) => defect.type === "scratch" && defect.sizeMm <= GRADING_THRESHOLDS.largeScratchMm).length;

  if (hasDentOrCrack || hasLargeScratch) return "C";
  if (defects.length === 0) return "A";
  if (smallScratchCount <= GRADING_THRESHOLDS.maxSmallScratchesForGradeB) return "B";
  return "C";
}
