import React from "react";
import { Route, Routes } from "react-router-dom";

import { HydrationData } from "../../../libs/types/hydration";

import "./index.scss";

const CurriculumModuleOverview = React.lazy(() => import("./overview"));
const CurriculumModule = React.lazy(() => import("./module"));
const CurriculumAbout = React.lazy(() => import("./about"));
const CurriculumLanding = React.lazy(() => import("./landing"));

export function Curriculum(appProps: HydrationData) {
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
