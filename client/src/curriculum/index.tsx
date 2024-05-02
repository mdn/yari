import { Route, Routes } from "react-router-dom";

import { HydrationData } from "../../../libs/types/hydration";
import { CurriculumModuleOverview } from "./overview";
import { CurriculumModule } from "./module";
import { CurriculumAbout } from "./about";
import { CurriculumLanding } from "./landing";

import "./index.scss";

export default function Curriculum(appProps: HydrationData) {
  return (
    <Routes>
      <Route path="/" element={<CurriculumLanding {...appProps} />} />
      <Route
        path="/about-curriculum/"
        element={<CurriculumAbout {...appProps} />}
      />
      <Route
        path="/:module/"
        element={<CurriculumModuleOverview {...appProps} />}
      />
      <Route path="/:module/*" element={<CurriculumModule {...appProps} />} />
    </Routes>
  );
}
