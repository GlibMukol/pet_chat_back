/* eslint-disable @typescript-eslint/no-explicit-any */
export class Helpers {
  static firstLatterUppercase(str: string) {
    return str
      .toLowerCase()
      .split(' ')
      .map(
        (item: string) =>
          `${item.charAt(0).toUpperCase()}${item.slice(1).toLowerCase()}`,
      )
      .join(' ');
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static generateRundomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  static parseJson(props: string): any {
    try {
      return JSON.parse(props);
    } catch (error) {
      return props;
    }
  }
}
