// --- App ---
// Any types which are shared between different parts of the App

export type Breadcrumb = {
  name: string;
  href: string;
};

export type FilterItem = {
  title?: string;
  counter?: number;
  tag?: string;
  active?: number;
  action?: (payload: MouseEvent) => void;
  menu?: {
    title?: string;
    action?: (payload: MouseEvent) => void;
    seperator?: boolean;
  }[];
};
