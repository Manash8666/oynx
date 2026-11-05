export type CanvasNodeType = 'route' | 'schema' | 'component';

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasNodeData {
  id: string;
  type: CanvasNodeType;
  label: string;
  filePath: string;
  methods?: string[]; // for routes: GET, POST
  fields?: string[]; // for schemas: id, name, email
  relations?: string[]; // foreign keys or relations
  position: CanvasPosition;
}

export interface CanvasEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface CanvasGraphState {
  nodes: CanvasNodeData[];
  edges: CanvasEdgeData[];
}
