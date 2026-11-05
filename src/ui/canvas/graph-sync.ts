import type { CanvasEdgeData, CanvasGraphState, CanvasNodeData } from './types.js';

export class CanvasGraphSync {
  private files = new Map<string, string>(); // filePath -> content

  public addFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
  }

  public removeFile(filePath: string): void {
    this.files.delete(filePath);
  }

  public buildGraph(): CanvasGraphState {
    const nodes: CanvasNodeData[] = [];
    const edges: CanvasEdgeData[] = [];

    let routeX = 350;
    let routeY = 100;
    let schemaX = 650;
    let schemaY = 100;
    let compX = 50;
    let compY = 100;

    for (const [filePath, content] of this.files.entries()) {
      const normalized = filePath.replace(/\\/g, '/');

      // 1. Backend Route Handlers: /api/* or routes/*
      if (normalized.includes('/api/') || normalized.includes('/routes/')) {
        const methods: string[] = [];
        if (/GET|get\(/i.test(content)) methods.push('GET');
        if (/POST|post\(/i.test(content)) methods.push('POST');
        if (/PUT|put\(/i.test(content)) methods.push('PUT');
        if (/DELETE|delete\(/i.test(content)) methods.push('DELETE');

        const label = normalized.split('/api/')[1] ? `/api/${normalized.split('/api/')[1].replace(/\.[a-z]+$/, '')}` : normalized;
        const id = `route_${normalized}`;

        nodes.push({
          id,
          type: 'route',
          label,
          filePath: normalized,
          methods: methods.length > 0 ? methods : ['GET'],
          position: { x: routeX, y: routeY },
        });
        routeY += 120;
      }

      // 2. Database Models / Schemas: schema.prisma, models/*, schemas/*
      else if (normalized.includes('schema') || normalized.includes('/models/') || normalized.includes('prisma')) {
        const fields: string[] = [];
        const fieldMatches = content.matchAll(/(?:([a-zA-Z0-9_]+)\s+String|([a-zA-Z0-9_]+)\s+Int|([a-zA-Z0-9_]+)\s*:\s*[a-zA-Z]+)/g);
        for (const m of fieldMatches) {
          const f = m[1] || m[2] || m[3];
          if (f && !fields.includes(f)) fields.push(f);
        }

        const modelMatch = content.match(/(?:model|table|schema)\s+([A-Za-z0-9_]+)/i);
        const label = modelMatch ? modelMatch[1] : normalized.split('/').pop()?.replace(/\.[a-z]+$/, '') || 'Schema';
        const id = `schema_${normalized}`;

        nodes.push({
          id,
          type: 'schema',
          label,
          filePath: normalized,
          fields,
          position: { x: schemaX, y: schemaY },
        });
        schemaY += 140;
      }

      // 3. Frontend Views & Components: src/pages/*, src/components/*
      else if (normalized.includes('/components/') || normalized.includes('/pages/') || normalized.includes('/views/')) {
        const compMatch = content.match(/function\s+([A-Z][A-Za-z0-9_]+)|const\s+([A-Z][A-Za-z0-9_]+)\s*=/);
        const label = compMatch ? compMatch[1] || compMatch[2] : normalized.split('/').pop()?.replace(/\.[a-z]+$/, '') || 'Component';
        const id = `component_${normalized}`;

        nodes.push({
          id,
          type: 'component',
          label,
          filePath: normalized,
          position: { x: compX, y: compY },
        });
        compY += 100;
      }
    }

    // Connect edges:
    // A. Frontend component fetch -> API route
    const routeNodes = nodes.filter((n) => n.type === 'route');
    const compNodes = nodes.filter((n) => n.type === 'component');
    const schemaNodes = nodes.filter((n) => n.type === 'schema');

    for (const comp of compNodes) {
      const content = this.files.get(comp.filePath) || '';
      for (const route of routeNodes) {
        if (content.includes(route.label)) {
          edges.push({
            id: `edge_${comp.id}_to_${route.id}`,
            source: comp.id,
            target: route.id,
            label: 'fetch',
          });
        }
      }
    }

    // B. Route -> Database schema relation
    for (const route of routeNodes) {
      const content = this.files.get(route.filePath) || '';
      for (const schema of schemaNodes) {
        if (content.toLowerCase().includes(schema.label.toLowerCase())) {
          edges.push({
            id: `edge_${route.id}_to_${schema.id}`,
            source: route.id,
            target: schema.id,
            label: 'queries',
          });
        }
      }
    }

    return { nodes, edges };
  }
}
