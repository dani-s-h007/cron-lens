export interface ParsedCron {
  fields: number[][];
  rawParts: string[];
  isSpecial: boolean;
}

export declare function parseCronExpression(expression: string): ParsedCron;
export declare function explainCron(expression: string): string;
export declare function getNextOccurrences(expression: string, count?: number, startDate?: Date): Date[];
export declare function formatDateInTimezone(date: Date, timeZone?: string): string;
export declare function naturalLanguageToCron(phrase: string): string;

