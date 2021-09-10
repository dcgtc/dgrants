// --- App ---
// Any types which are shared between different parts of the App

// used to route to a specific named route (with optional params/query)
export type RouteTarget = {
  name: string; // the routes name we're navigating to
  params?: {
    [key: string]: string | number; // any params we want to feed into the route
  };
  query?: {
    [key: string]: string | number; // any query string elements we want to feed into the route
  };
};

// individual crumb in the breadcrumb
export type Breadcrumb = {
  displayName: string; // what is shown in the breadcrumb trail
  routeTarget: RouteTarget; // path `name` defined in `app/src/router/index.ts`
};

// feeds the BaseFilterNav and represents an individual tab on the nav
export type FilterNavItem = {
  label: string; // text to display on the tab
  counter?: number; // optional counter to display next to the tab
  tag?: string; // optional tag to display next to the tab
  action?: (payload: MouseEvent) => void; // action to take when we click the tab
  active?: number; // which menu item is currently active
  menu?: {
    label?: string; // optional label to display in the menu
    action?: (payload: MouseEvent) => void; // action to take on click of the menu item
    separator?: boolean; // optional separator flag - this will display a line instead of a menu item
  }[]; // optional menu array
};

// feeds the BaseFilterNav and represents a single optional (right aligned) button
export type FilterNavButton = {
  label: string; // label to display in the button
  action?: (payload: MouseEvent) => void; // action to take when we click the button
};
