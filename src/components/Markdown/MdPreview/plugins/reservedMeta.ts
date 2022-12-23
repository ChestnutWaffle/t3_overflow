import type { Plugin } from "unified";
import type { Root, RootContent } from "hast";
import { visit } from "unist-util-visit";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ReservedMetaOptions {}

export const reservedMeta: Plugin<[ReservedMetaOptions?], Root> = (
  options = {}
) => {
  return (tree) => {
    visit(tree, (node: Root | RootContent) => {
      if (
        node.type === "element" &&
        node.tagName === "code" &&
        node.data &&
        node.data.meta
      ) {
        node.properties = {
          ...node.properties,
          "data-meta": String(node.data.meta),
        };
      }
    });
  };
};
