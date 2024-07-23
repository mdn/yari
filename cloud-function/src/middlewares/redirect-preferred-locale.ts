import { NextFunction, Request, Response } from "express";
import { normalizePath, redirect } from "../utils.js";
import { CANONICALS } from "../canonicals.js";

export async function redirectPreferredLocale(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check 1: Does the user prefer a locale?

  const preferredLocale = req.cookies["preferredlocale"];

  if (!preferredLocale) {
    next();
    return;
  }

  // Check 2: Does the target have a different locale?

  const target = new URL(req.url, `${req.protocol}://${req.headers.host}`);
  const targetPathname = target.pathname;
  const [targetLocale, targetSlug] = localeAndSlugOf(target);

  if (targetLocale.toLowerCase() === preferredLocale.toLowerCase()) {
    next();
    return;
  }

  // Check 3: Did the user manually switch the locale?

  if (req.headers.referer) {
    const source = new URL(req.headers.referer);
    const [, sourceSlug] = localeAndSlugOf(source);

    if (targetSlug.toLowerCase() === sourceSlug.toLowerCase()) {
      // User manually switched locale.
      next();
      return;
    }
  }

  // Check 4: Does the target exist in the preferred locale?

  const preferredPathname =
    CANONICALS[normalizePath(`/${preferredLocale}/${targetSlug}`)] ?? null;
  if (preferredPathname && preferredPathname !== targetPathname) {
    const location = preferredPathname + target.search;
    return redirect(res, location);
  }

  next();
}

function localeAndSlugOf(url: URL): [string, string] {
  const locale = url.pathname.split("/").at(1) || "";
  const slug = url.pathname.split("/").slice(2).join("/");

  return [locale, slug];
}
