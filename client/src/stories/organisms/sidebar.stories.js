import React from "react";

import { sidebarHTML } from "../mocks/sidebar-html";
import { sidebarHTMLWithIcons } from "../mocks/sidebar-icons";
import { sidebarHTMLHTTPStatus } from "../mocks/sidebar-http";
import { sidebarHTMLLearn } from "../mocks/sidebar-learn";

import { RenderSideBar } from "../../document/organisms/sidebar";

const defaults = {
  title: "Organisms/Sidebar",
};

export default defaults;

export const sidebar = () => <RenderSideBar doc={sidebarHTML} />;

export const sidebarWithIcons = () => (
  <RenderSideBar doc={sidebarHTMLWithIcons} />
);

export const sidebarLearn = () => <RenderSideBar doc={sidebarHTMLLearn} />;

export const sidebarHttp = () => <RenderSideBar doc={sidebarHTMLHTTPStatus} />;
