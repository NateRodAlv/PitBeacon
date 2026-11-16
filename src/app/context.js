// The app's shared singletons. Every module imports what it needs from here
// instead of reaching into globals.

import { config } from "../../config.js";
import { StateManager } from "../core/state.js";
import { SDK } from "../core/sdk.js";
import { audioFiles } from "../core/audio.js";
import { CardRegistry } from "../cards/registry.js";
import { LayoutValidator } from "../cards/validator.js";
import { DeveloperCardRuntime } from "../cards/developerCardRuntime.js";
import { DataSourceManager } from "../data/sources.js";
import { CardCatalog } from "../data/cardCatalog.js";
import { LayoutRenderer } from "../ui/layoutRenderer.js";
import { DocsModal } from "../ui/docsModal.js";

export { config, audioFiles };

export const stateManager = new StateManager({
  currentMatches: null,
  currentEventData: null,
  currentRankings: null,
  currentTeamSummaryData: null,
  lastMatchAlertId: null,
  fullDate: new Date(),
  teamNumber: config.teamNumber,
  isTestMode: false,
  dataStatus: null,
});

export const registry = new CardRegistry();
export const dataSources = new DataSourceManager(config, stateManager);
export const sdk = new SDK(stateManager, dataSources, audioFiles, config);
export const devCardRuntime = new DeveloperCardRuntime(registry, sdk);
export const cardCatalog = new CardCatalog(config, devCardRuntime, stateManager, sdk);
export const validator = new LayoutValidator(registry);
export const renderer = new LayoutRenderer(registry, validator, stateManager, dataSources, sdk);
export const docsModal = new DocsModal();

export function renderLayout() {
  renderer.render(config, document.getElementById("container"));
}
