export type Edge = {
  source: string;
  target: string;
};

export function topologicallySortNodes(nodes: string[], edges: Edge[]): string[] {
  const incoming = new Map(nodes.map((node) => [node, 0]));
  const outgoing = new Map(nodes.map((node) => [node, [] as string[]]));

  for (const edge of edges) {
    if (!incoming.has(edge.source)) {
      throw new Error(`Invalid edge: source "${edge.source}" is not in the node list`);
    }

    if (!incoming.has(edge.target)) {
      throw new Error(`Invalid edge: target "${edge.target}" is not in the node list`);
    }

    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const queue = nodes.filter((node) => incoming.get(node) === 0);
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift();

    if (!node) {
      continue;
    }

    order.push(node);

    for (const target of outgoing.get(node) ?? []) {
      incoming.set(target, (incoming.get(target) ?? 1) - 1);

      if (incoming.get(target) === 0) {
        queue.push(target);
      }
    }
  }

  if (order.length !== nodes.length) {
    throw new Error("Cycle detected");
  }

  return order;
}
