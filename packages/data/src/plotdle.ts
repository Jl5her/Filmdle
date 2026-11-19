// Separate entry point so the ~330 KB plot pool only ships with Plotdle,
// not with every game that imports "@stardle/data".
import type { PlotdlePlot } from "@stardle/types"
import plotsJson from "./plotdle/plots.json" with { type: "json" }

export const plots = plotsJson as PlotdlePlot[]
