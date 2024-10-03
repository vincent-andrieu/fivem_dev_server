import { performance as nodePerformance } from "perf_hooks";

// @ts-expect-error perf_hooks is the default node performance module
global.performance = nodePerformance;
