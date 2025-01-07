import { MDNImageHistory, TeamMember } from "./about";
import { ContributorList } from "./community/contributor-list";
import { ScrimInline } from "./curriculum/scrim-inline";
import { PlayConsole } from "./play/console";

declare global {
  interface HTMLElementTagNameMap {
    "mdn-image-history": MDNImageHistory;
    "team-member": TeamMember;
    "contributor-list": ContributorList;
    "scrim-inline": ScrimInline;
    "play-console": PlayConsole;
  }
}
