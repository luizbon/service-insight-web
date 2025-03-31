class DynamicPropertyResolver {
  private static readonly PREFIX = 'nservicebus.';
  private properties: Map<string, any>;

  constructor(keyValuePairs: KeyValuePair[]) {
    this.properties = new Map(
      keyValuePairs.map(pair => [pair.key, pair.value])
    );

    return new Proxy(this, {
      get(target, prop: string) {
        if (prop in target) {
          return target[prop as keyof DynamicPropertyResolver];
        }
        return target.getValue(prop);
      }
    });
  }

  private normalizeKey(key: string): string {
    key = key.toLowerCase();
    return key.startsWith(DynamicPropertyResolver.PREFIX) 
      ? key.substring(DynamicPropertyResolver.PREFIX.length) 
      : key;
  }

  getValue(key: string): any {
    const normalizedSearchKey = this.normalizeKey(key);
    for (const [storedKey] of this.properties) {
      if (this.normalizeKey(storedKey) === normalizedSearchKey) {
        return this.properties.get(storedKey);
      }
    }
    return undefined;
  }

  hasKey(key: string): boolean {
    const normalizedSearchKey = this.normalizeKey(key);
    for (const [storedKey] of this.properties) {
      if (this.normalizeKey(storedKey) === normalizedSearchKey) {
        return true;
      }
    }
    return false;
  }

  getAllKeys(): string[] {
    return Array.from(this.properties.keys());
  }
}

export default DynamicPropertyResolver;
