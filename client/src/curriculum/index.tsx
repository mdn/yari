import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumOverview } from "./overview";
import { CurriculumModule } from "./module";
import { CurriculumAbout } from "./about";
import { CurriculumLanding } from "./landing";

import "./index.scss";
import { CurriculumData, CurriculumDoc } from "../../../libs/types/curriculum";
import { Template, useCurriculumDoc } from "./utils";
import { CurriculumDefault } from "./default";

export function Curriculum(appProps: HydrationData<any, CurriculumDoc>) {
  const doc = useCurriculumDoc(appProps as CurriculumData);
  switch (doc?.template) {
    case Template.Landing:
      return <CurriculumLanding {...appProps} />;
    case Template.Overview:
      return <CurriculumOverview {...appProps} />;
    case Template.Module:
      return <CurriculumModule {...appProps} />;
    case Template.About:
      return <CurriculumAbout {...appProps} />;
    case Template.Default:
    default:
      return <CurriculumDefault {...appProps} />;
  }
}
