export const MODULES = [
  "identity",
  "learning-profile",
  "import",
  "library",
  "content",
  "language",
  "reader",
  "vocabulary",
  "learning",
] as const;
export * from "./import/index";
export * from "./language/index";
export * from "./reader/index";
export * from "./vocabulary/index";
export * from "./application/index";
export * from "./identity/index";
export * from "./learning-profile/index";
export * from "./content/index";
export * from "./library/index";
export * from "./learning/index";
