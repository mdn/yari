import { Route, Routes } from "react-router-dom";

import { PageNotFound } from "../page-not-found";

import ObservatoryLanding from "./landing";
import ObservatoryResults from "./results";
import ObservatoryDocs from "./docs";
import "./index.scss";

export default function Observatory({ ...props }) {
  return (
    <div className="observatory">
      <Routes>
        <Route path="/" element={<ObservatoryLanding />} />
        <Route path="/analyze" element={<ObservatoryResults />} />
        <Route path="/docs/*" element={<ObservatoryDocs {...props} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}
