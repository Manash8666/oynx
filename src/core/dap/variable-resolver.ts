import type { Scope, Variable } from './types.js';

export class VariableResolver {
  private variablePool = new Map<number, Variable[]>();
  private nextReferenceId = 1000;

  public registerScopeVariables(scopeName: string, vars: Record<string, unknown>): Scope {
    const refId = this.nextReferenceId++;
    const varList: Variable[] = [];

    for (const [key, val] of Object.entries(vars)) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const childRef = this.nextReferenceId++;
        this.variablePool.set(
          childRef,
          Object.entries(val as Record<string, unknown>).map(([k, v]) => ({
            name: k,
            value: String(v),
            type: typeof v,
            variablesReference: 0,
          }))
        );
        varList.push({
          name: key,
          value: 'Object',
          type: 'object',
          variablesReference: childRef,
        });
      } else {
        varList.push({
          name: key,
          value: JSON.stringify(val),
          type: typeof val,
          variablesReference: 0,
        });
      }
    }

    this.variablePool.set(refId, varList);

    return {
      name: scopeName,
      variablesReference: refId,
      expensive: false,
    };
  }

  public getVariables(variablesReference: number): Variable[] {
    return this.variablePool.get(variablesReference) || [];
  }

  /**
   * Serializes active scopes into structured LLM agent context
   */
  public serializeForAgent(scopes: Scope[]): Record<string, Record<string, string>> {
    const output: Record<string, Record<string, string>> = {};

    for (const scope of scopes) {
      const vars = this.getVariables(scope.variablesReference);
      const scopeMap: Record<string, string> = {};
      for (const v of vars) {
        scopeMap[v.name] = v.value;
      }
      output[scope.name] = scopeMap;
    }

    return output;
  }
}
