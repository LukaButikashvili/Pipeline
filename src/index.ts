interface ValidationResult {
  isValid: boolean;
  message: string | null;
}

type SyncValidator = (value: unknown) => ValidationResult;

type AsyncValidator = (value: number | null) => Promise<ValidationResult>;

interface CheckArgumentsType {
  targetType: "string" | "number";
}

interface CheckAsyncArgumentsType {
  callback: (value: number) => Promise<void>;
  timeout?: number;
}

interface CheckNumberValueType {
  min: number;
  max: number;
}

export const checkType =
  ({ targetType }: CheckArgumentsType) =>
  (value: unknown): ValidationResult => {
    if (typeof value === targetType) {
      return {
        isValid: true,
        message: null,
      };
    }

    return {
      isValid: false,
      message: `Value is not a ${targetType}`,
    };
  };

export const checkNumberValue =
  ({ min, max }: CheckNumberValueType) =>
  (value: unknown): ValidationResult => {
    if (typeof value !== "number") {
      return {
        isValid: false,
        message: "Value is not a number",
      };
    }

    const isValid = value >= min && value <= max;

    return {
      isValid,
      message: isValid ? null : `Value should be between ${min} and ${max}`,
    };
  };

  export const checkStringLength =
    ({ min, max }: CheckNumberValueType) =>
    (value: unknown): ValidationResult => {
      if (typeof value !== "string") {
        return {
          isValid: false,
          message: "Value is not a string",
        };
      }

      const stringLength = value.length;

      const isValid = stringLength >= min && stringLength <= max;
      return {
        isValid,
        message: isValid ? null : `Length should be between ${min} and ${max}`,
      };
    };


export const syncValidate = (value: unknown, validators: SyncValidator[]) => validators.map((validator) => validator(value));

export async function asyncValidate(
  value: number | null,
  validators: AsyncValidator[]
): Promise<ValidationResult[]> {
  return await Promise.all(validators.map((validator) => validator(value)));
}

export const checkAsync =
  ({ callback, timeout }: CheckAsyncArgumentsType) =>
  async (value: number | null) => {
    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<void>((_, reject) => {
      if (timeout !== undefined) {
        timer = setTimeout(() => reject(new Error("Timeout")), timeout);
        timer.unref();
      }
    });

    try {
      await Promise.race([callback(Number(value)), timeoutPromise]);

      return {
        isValid: true,
        message: null,
      };
    } catch (e) {
      return {
        isValid: false,
        message: e instanceof Error ? e.message : null,
      };
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };

export class StdoutReporter {
  private result: ValidationResult[];

  constructor(result: ValidationResult[]) {
    this.result = result;
  }

  isValid = (): boolean => {
    return this.result.every((res) => res.isValid);
  };

  pickInvalid = (): ValidationResult[] => {
    return this.result.filter((res) => !res.isValid);
  };

  pickValid = (): ValidationResult[] => {
    return this.result.filter((res) => res.isValid);
  };

  report = (): void => {
    this.result.forEach((res, index) => {
      console.log(
        `[#${index}][ ${res.isValid ? "valid" : "invalid"} ] | ${res.message}`
      );
    });
  };
}