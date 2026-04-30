import type { CannonFunctionName } from "../types";

/** Single shot / branch reference (no nesting). */
export type LeafStrategyId = "meriam_once" | "rentaka_once";

/** Strategy tree: stacks per cannon after automatic nearest-ship lock-on (see generator). */
export type StrategyNode =
  | { kind: "leaf"; leafId: LeafStrategyId }
  | {
      kind: "if_strong_else";
      thenNodes: StrategyNode[];
      elseNodes: StrategyNode[];
    }
  | {
      kind: "for_loop";
      count: number;
      bodyNodes: StrategyNode[];
    };

export type VisualProgram = Record<CannonFunctionName, StrategyNode[]>;

export type PaletteTemplateId = LeafStrategyId | "if_strong_else" | "for_loop_three";

export type SlotBranch = "then" | "else" | "body";

export type BranchPathStep = {
  /** Index in the current list of the container node */
  containerIndex: number;
  branch: SlotBranch;
};

/** Walk from a cannon’s root list: each step picks a node and enters one of its child lists. */
export type BranchPath = readonly BranchPathStep[];

export const PALETTE_ORDER: PaletteTemplateId[] = [
  "if_strong_else",
  "for_loop_three",
  "meriam_once",
  "rentaka_once",
];

export const PALETTE_TEMPLATE_CATALOG: Record<
  PaletteTemplateId,
  { label: string; description: string }
> = {
  if_strong_else: {
    label: "If / else (strong target)",
    description:
      "If the locked ship is a Colonizer Galleon or has more than 40 HP, runs the blocks in “Then”; otherwise runs “Else”. Put Meriam, Rentaka, or a for-loop inside each branch.",
  },
  for_loop_three: {
    label: "For loop (×3)",
    description:
      "Repeats three times — use with Rentaka shots inside the loop (multi-shot Rentaka pattern). You can nest Meriam or Rentaka blocks in the loop body.",
  },
  meriam_once: {
    label: "Meriam once",
    description: "Fire one Meriam at the locked ship.",
  },
  rentaka_once: {
    label: "Rentaka once",
    description: "Fire one Rentaka at the locked ship.",
  },
};

export const buildPaletteNode = (templateId: PaletteTemplateId): StrategyNode => {
  switch (templateId) {
    case "meriam_once":
      return { kind: "leaf", leafId: "meriam_once" };
    case "rentaka_once":
      return { kind: "leaf", leafId: "rentaka_once" };
    case "if_strong_else":
      return { kind: "if_strong_else", thenNodes: [], elseNodes: [] };
    case "for_loop_three":
      return { kind: "for_loop", count: 3, bodyNodes: [] };
    default: {
      const exhaustive: never = templateId;
      return exhaustive;
    }
  }
};

export const cloneStrategyNode = (node: StrategyNode): StrategyNode =>
  JSON.parse(JSON.stringify(node)) as StrategyNode;

const getBranchArray = (node: StrategyNode, branch: SlotBranch): StrategyNode[] => {
  if (node.kind === "if_strong_else") {
    if (branch === "then") return node.thenNodes;
    if (branch === "else") return node.elseNodes;
    return [];
  }

  if (node.kind === "for_loop") {
    if (branch === "body") return node.bodyNodes;
    return [];
  }

  return [];
};

const setBranchArray = (node: StrategyNode, branch: SlotBranch, list: StrategyNode[]): StrategyNode => {
  if (node.kind === "if_strong_else") {
    if (branch === "then") return { ...node, thenNodes: list };
    if (branch === "else") return { ...node, elseNodes: list };
    return node;
  }

  if (node.kind === "for_loop" && branch === "body") {
    return { ...node, bodyNodes: list };
  }

  return node;
};

export const descendList = (nodes: StrategyNode[], path: BranchPath): StrategyNode[] => {
  if (path.length === 0) {
    return nodes;
  }

  const [head, ...tail] = path;
  const parent = nodes[head.containerIndex];
  if (!parent) {
    return [];
  }

  const inner = getBranchArray(parent, head.branch);
  return descendList(inner, tail);
};

const replaceListAtBranchPath = (
  nodes: StrategyNode[],
  path: BranchPath,
  listFn: (list: StrategyNode[]) => StrategyNode[],
): StrategyNode[] => {
  if (path.length === 0) {
    return listFn(nodes);
  }

  const [head, ...tail] = path;
  return nodes.map((node, index) => {
    if (index !== head.containerIndex) {
      return node;
    }

    const inner = getBranchArray(node, head.branch);
    const updatedInner = replaceListAtBranchPath(inner, tail, listFn);
    return setBranchArray(node, head.branch, updatedInner);
  });
};

export const modifyListAtPath = (
  program: VisualProgram,
  cannon: CannonFunctionName,
  path: BranchPath,
  listFn: (list: StrategyNode[]) => StrategyNode[],
): VisualProgram => {
  const roots = program[cannon];
  return {
    ...program,
    [cannon]: replaceListAtBranchPath(roots, path, listFn),
  };
};

export const leafLabel = (leafId: LeafStrategyId): string =>
  PALETTE_TEMPLATE_CATALOG[leafId].label;

export const nodeSummaryLabel = (node: StrategyNode): string => {
  switch (node.kind) {
    case "leaf":
      return PALETTE_TEMPLATE_CATALOG[node.leafId].label;
    case "if_strong_else":
      return PALETTE_TEMPLATE_CATALOG.if_strong_else.label;
    case "for_loop":
      return `For loop (×${node.count})`;
    default: {
      const exhaustive: never = node;
      return exhaustive;
    }
  }
};

export const nodeDescriptionText = (node: StrategyNode): string => {
  switch (node.kind) {
    case "leaf":
      return PALETTE_TEMPLATE_CATALOG[node.leafId].description;
    case "if_strong_else":
      return PALETTE_TEMPLATE_CATALOG.if_strong_else.description;
    case "for_loop":
      return PALETTE_TEMPLATE_CATALOG.for_loop_three.description;
    default: {
      const exhaustive: never = node;
      return exhaustive;
    }
  }
};

/** Default stacks: Meriam on strong hulls else a 3-shot Rentaka loop. */
export const DEFAULT_VISUAL_PROGRAM: VisualProgram = {
  cannon1: [
    {
      kind: "if_strong_else",
      thenNodes: [{ kind: "leaf", leafId: "meriam_once" }],
      elseNodes: [
        {
          kind: "for_loop",
          count: 3,
          bodyNodes: [{ kind: "leaf", leafId: "rentaka_once" }],
        },
      ],
    },
  ],
  cannon2: [
    {
      kind: "if_strong_else",
      thenNodes: [{ kind: "leaf", leafId: "meriam_once" }],
      elseNodes: [
        {
          kind: "for_loop",
          count: 3,
          bodyNodes: [{ kind: "leaf", leafId: "rentaka_once" }],
        },
      ],
    },
  ],
  cannon3: [
    {
      kind: "if_strong_else",
      thenNodes: [{ kind: "leaf", leafId: "meriam_once" }],
      elseNodes: [
        {
          kind: "for_loop",
          count: 3,
          bodyNodes: [{ kind: "leaf", leafId: "rentaka_once" }],
        },
      ],
    },
  ],
};

const CANNON_ORDER: CannonFunctionName[] = ["cannon1", "cannon2", "cannon3"];

const getCannonNumber = (name: CannonFunctionName) => name.replace("cannon", "");

const pad = (indent: number) => "  ".repeat(indent);

const emitEmptySlotComment = (indent: number) => `${pad(indent)}// (empty)`;

const emitNode = (node: StrategyNode, cannonName: CannonFunctionName, indent: number): string => {
  const n = getCannonNumber(cannonName);
  const i = pad(indent);

  switch (node.kind) {
    case "leaf": {
      if (node.leafId === "meriam_once") {
        return `${i}artillery.fireMeriam(nearestShip.id);\n${i}command.log("Cannon ${n} Meriam at " + nearestShip.type + ".");`;
      }

      return `${i}artillery.fireRentaka(nearestShip.id);\n${i}command.log("Cannon ${n} Rentaka at " + nearestShip.id + ".");`;
    }

    case "if_strong_else": {
      const thenInner =
        node.thenNodes.length > 0
          ? `\n${node.thenNodes.map((child) => emitNode(child, cannonName, indent + 1)).join("\n\n")}\n${i}`
          : `\n${emitEmptySlotComment(indent + 1)}\n${i}`;
      const elseInner =
        node.elseNodes.length > 0
          ? `\n${node.elseNodes.map((child) => emitNode(child, cannonName, indent + 1)).join("\n\n")}\n${i}`
          : `\n${emitEmptySlotComment(indent + 1)}\n${i}`;

      return `${i}if (nearestShip.type === "Colonizer Galleon" || nearestShip.hp > 40) {${thenInner}} else {${elseInner}}`;
    }

    case "for_loop": {
      const bodyInner =
        node.bodyNodes.length > 0
          ? `\n${node.bodyNodes.map((child) => emitNode(child, cannonName, indent + 1)).join("\n\n")}\n${i}`
          : `\n${emitEmptySlotComment(indent + 1)}\n${i}`;

      return `${i}for (let bullet = 0; bullet < ${node.count}; bullet++) {${bodyInner}}`;
    }

    default: {
      const exhaustive: never = node;
      return exhaustive;
    }
  }
};

const emitCannonStatements = (
  roots: StrategyNode[],
  cannonName: CannonFunctionName,
  indentBase: number,
): string =>
  roots.length > 0
    ? roots.map((statement) => emitNode(statement, cannonName, indentBase)).join("\n\n")
    : emitEmptySlotComment(indentBase);

const emitCannonFunction = (cannonName: CannonFunctionName, roots: StrategyNode[]): string =>
  `function ${cannonName}(radar, artillery, command) {
${roots.length === 0 ? "  return;" : `  const nearestShip = getNearestShip(radar);

  if (!nearestShip) {
    return;
  }

${emitCannonStatements(roots, cannonName, 2)}`}
}`;

/** Blocks / tree are source of truth: this string is what the game executes. */
export const generateJavaScriptFromVisual = (program: VisualProgram): string => {
  const helper = `// Generated from visual logic (blocks are source of truth).
const getNearestShip = (radar) => {
  const ships = radar.getShips();

  return ships
    .filter((ship) => ship.hp > 0)
    .sort((a, b) => a.distance - b.distance)[0];
};

`;

  const functions = CANNON_ORDER.map((name) => emitCannonFunction(name, program[name])).join("\n\n");

  return `${helper}${functions}
`;
};

export const insertNodeAt = (
  list: StrategyNode[],
  index: number,
  node: StrategyNode,
): StrategyNode[] => {
  const next = [...list];
  next.splice(index, 0, node);
  return next;
};

export const removeNodeAt = (list: StrategyNode[], index: number): StrategyNode[] =>
  list.filter((_, itemIndex) => itemIndex !== index);

export const moveNodeWithinList = (
  list: StrategyNode[],
  fromIndex: number,
  dropIndex: number,
): StrategyNode[] => {
  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  if (removed === undefined) {
    return list;
  }

  const insertIndex = fromIndex < dropIndex ? dropIndex - 1 : dropIndex;
  const clampedInsert = Math.max(0, Math.min(insertIndex, next.length));
  next.splice(clampedInsert, 0, removed);
  return next;
};
