/**
 * Menu SSoT (Information Architecture)
 *
 * This file defines:
 * - What screens exist in the SaaS
 * - How they are grouped
 * - Which features are reachable by users
 *
 * Features MUST NOT define their own entry points.
 */

export type MenuItem = {
    id: string;
    label: string;
    path?: string;
    children?: MenuItem[];
  };
  
  export const menu: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "planning",
      label: "Planning",
      children: [
        {
          id: "budget-entry",
          label: "Budget Entry",
          path: "/planning/budget-entry",
        },
      ],
    },
    {
      id: "analysis",
      label: "Analysis",
      children: [
        {
          id: "budget-vs-actual",
          label: "Budget vs Actual",
          path: "/analysis/budget-vs-actual",
        },
      ],
    },
    {
      id: "master-data",
      label: "Master Data",
      children: [
        {
          id: "employee-master",
          label: "Employees",
          path: "/master-data/employees",
        },
        {
          id: "organization-master",
          label: "Organizations",
          path: "/master-data/organizations",
        },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      children: [
        {
          id: "user-management",
          label: "Users & Roles",
          path: "/settings/users",
        },
      ],
    },
  ];
  