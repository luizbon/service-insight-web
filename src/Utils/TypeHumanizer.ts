class TypeHumanizer {
  static toName(type: string): string | undefined {
    if (!type) return undefined;

    const clazz = type.split(',')[0];
    const objectName = clazz.split('.').pop();
    if (!objectName) return undefined; // Add null check
    return objectName.replace('+', '.');
  }
}

export default TypeHumanizer;
