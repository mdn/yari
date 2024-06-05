#!/usr/bin/env node
import { buildCurriculum, buildCurriculumSitemap } from "./curriculum.js";

await buildCurriculum({ verbose: true });
await buildCurriculumSitemap({ verbose: true });
