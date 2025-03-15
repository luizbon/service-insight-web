import humanizeDuration from "humanize-duration";

class TypeHumanizer {
  static toName(type: string): string | undefined {
    if (!type) return undefined;

    const clazz = type.split(',')[0];
    const objectName = clazz.split('.').pop();
    if (!objectName) return undefined; // Add null check
    return objectName.replace('+', '.');
  }

  static formatProcessingTime = (time: string) => {
    const date = new Date(`1970-01-01T${time}Z`);
    const milliseconds = date.getTime();
    return humanizeDuration(milliseconds, { units: ["h", "m", "s", "ms"], round: true });
  };
}

export default TypeHumanizer;
