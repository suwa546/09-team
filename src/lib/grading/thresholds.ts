export const GRADING_THRESHOLDS = {
  largeScratchMm: 1,
  maxSmallScratchesForGradeB: 5,
} as const;

export const IMAGE_ANALYSIS_THRESHOLDS = {
  maxWidthPx: 640,
  sobelEdgeStrength: 110,
  minComponentPixels: 12,
  maxComponentAreaRatio: 0.2,
  millimetersPerPixel: 0.12,
  crackAspectRatio: 6,
  dentMinAreaPixels: 180,
} as const;
