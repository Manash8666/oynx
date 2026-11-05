import { describe, it, expect, beforeEach } from 'vitest';
import { CanvasGraphSync } from '../../src/ui/canvas/graph-sync.js';

describe('Infinite Architecture Canvas Engine (Prompt 5)', () => {
  let sync: CanvasGraphSync;

  beforeEach(() => {
    sync = new CanvasGraphSync();
  });

  it('should instantiate RouteNode, SchemaNode, and ComponentNode from file structure', () => {
    // 1. Schema
    sync.addFile(
      'prisma/schema.prisma',
      `
model User {
  id    String @id
  email String
  role  String
}
`
    );

    // 2. API Route
    sync.addFile(
      'src/pages/api/users.ts',
      `
import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await prisma.user.findMany();
    res.json(users);
  }
}
`
    );

    // 3. Frontend View Component
    sync.addFile(
      'src/components/UserList.tsx',
      `
export function UserList() {
  const fetchUsers = () => fetch('/api/users');
  return <div>Users</div>;
}
`
    );

    const graph = sync.buildGraph();

    expect(graph.nodes.length).toBe(3);

    const routeNode = graph.nodes.find((n) => n.type === 'route');
    const schemaNode = graph.nodes.find((n) => n.type === 'schema');
    const componentNode = graph.nodes.find((n) => n.type === 'component');

    expect(routeNode).toBeDefined();
    expect(routeNode?.label).toBe('/api/users');
    expect(routeNode?.methods).toContain('GET');

    expect(schemaNode).toBeDefined();
    expect(schemaNode?.label).toBe('User');

    expect(componentNode).toBeDefined();
    expect(componentNode?.label).toBe('UserList');

    // Verify edges: Component -> Route (fetch), and Route -> Schema (queries)
    expect(graph.edges.length).toBe(2);

    const fetchEdge = graph.edges.find((e) => e.label === 'fetch');
    expect(fetchEdge?.source).toBe(componentNode?.id);
    expect(fetchEdge?.target).toBe(routeNode?.id);

    const queryEdge = graph.edges.find((e) => e.label === 'queries');
    expect(queryEdge?.source).toBe(routeNode?.id);
    expect(queryEdge?.target).toBe(schemaNode?.id);
  });
});
