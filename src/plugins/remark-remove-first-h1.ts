import type { Root } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Remove the first h1 heading from markdown content
 */
export const remarkRemoveFirstH1: Plugin<[], Root> = function () {
  return function (tree) {
    const children = tree.children;
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.type === 'heading' && node.depth === 1) {
        // Remove the first h1 found
        children.splice(i, 1);
        break;
      }
    }
  };
};
