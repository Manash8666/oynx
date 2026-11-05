import type { DependencyGraphBuilder } from '../ast/graph-builder.js';
import type { ImpactedConsumer } from './types.js';

export class ImpactGraphTraversal {
  private graphBuilder: DependencyGraphBuilder;

  constructor(graphBuilder: DependencyGraphBuilder) {
    this.graphBuilder = graphBuilder;
  }

  public findConsumers(sourceFilePath: string, symbolName: string): {
    direct: ImpactedConsumer[];
    transitive: ImpactedConsumer[];
    tests: ImpactedConsumer[];
  } {
    const direct: ImpactedConsumer[] = [];
    const transitive: ImpactedConsumer[] = [];
    const tests: ImpactedConsumer[] = [];

    const nodeId = `${sourceFilePath}#${symbolName}`;
    const visited = new Set<string>();
    visited.add(nodeId);

    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const incomingNodeIds = this.graphBuilder.getDependents(current.id);

      for (const callerId of incomingNodeIds) {
        if (!visited.has(callerId)) {
          visited.add(callerId);
          const callerNode = this.graphBuilder.getNode(callerId);
          if (callerNode) {
            const isTestFile = /\.(spec|test)\.[a-z]+$/.test(callerNode.filePath);
            const consumer: ImpactedConsumer = {
              filePath: callerNode.filePath,
              symbolName: callerNode.name,
              isTestFile,
              depth: current.depth + 1,
            };

            if (isTestFile) {
              tests.push(consumer);
            } else if (current.depth === 0) {
              direct.push(consumer);
            } else {
              transitive.push(consumer);
            }

            queue.push({ id: callerId, depth: current.depth + 1 });
          }
        }
      }
    }

    return { direct, transitive, tests };
  }
}
