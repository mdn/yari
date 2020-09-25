import React from "react";

import { sidebarHTML } from "../mocks/sidebar-html";
import { sidebarHTMLWithIcons } from "../mocks/sidebar-icons";

import { RenderSideBar } from "../../ui/organisms/sidebar";

export default {
  title: "Organisms/Sidebar",
};

export const sidebar = () => <RenderSideBar doc={sidebarHTML} />;

export const sidebarWithIcons = () => (
  <RenderSideBar doc={sidebarHTMLWithIcons} />
);
