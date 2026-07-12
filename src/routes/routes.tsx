import type { ComponentType } from "react";
import { UserFormPage } from "../01-user-form/Page";

export interface AppRoute {
  path: string;
  label: string;
  Component: ComponentType;
}

export const routes: AppRoute[] = [
  {
    path: "/01-user-form",
    label: "01 - User Form",
    Component: UserFormPage,
  },
];
