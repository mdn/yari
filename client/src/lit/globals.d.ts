import { MDNImageHistory, TeamMember } from "./about";
import { InteractiveExample } from "./interactive-example";
import { TabPanel, Tab, TabWrapper } from "./interactive-example/tabs";
import { ContributorList } from "./community/contributor-list";
import { ScrimInline } from "./curriculum/scrim-inline";
import { PlayConsole } from "./play/console";
import { PlayController } from "./play/controller";
import { PlayEditor } from "./play/editor";
import { PlayRunner } from "./play/runner";

declare global {
  interface HTMLElementTagNameMap {
    "mdn-image-history": MDNImageHistory;
    "team-member": TeamMember;
    "interactive-example": InteractiveExample;
    "ix-tab": Tab;
    "ix-tab-panel": TabPanel;
    "ix-tab-wrapper": TabWrapper;
    "contributor-list": ContributorList;
    "scrim-inline": ScrimInline;
    "play-console": PlayConsole;
    "play-controller": PlayController;
    "play-editor": PlayEditor;
    "play-runner": PlayRunner;
  }

  interface WindowEventMap {
    "glean-click": CustomEvent<string>;
  }
}
