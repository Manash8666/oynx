export class SchemaSynthesizer {
  public static parameterizeRoute(urlPath: string): { template: string; params: string[] } {
    const segments = urlPath.split('/').filter(Boolean);
    const params: string[] = [];

    const parameterized = segments.map((seg, idx) => {
      // Numbers or UUIDs or alphanumeric IDs
      if (/^\d+$/.test(seg)) {
        params.push('id');
        return ':id';
      }
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) {
        params.push('uuid');
        return ':uuid';
      }
      if (/^[0-9a-zA-Z_-]{20,}$/.test(seg)) {
        params.push('token');
        return ':token';
      }
      return seg;
    });

    return {
      template: '/' + parameterized.join('/'),
      params,
    };
  }
}
