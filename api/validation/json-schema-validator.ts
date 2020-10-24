import Ajv, { ErrorObject } from 'ajv';
import { Schema } from '../schema';

export type ValidateFunction<T> = {
  (data: T, dataPath?: string, parentData?: object | unknown[], parentDataProperty?: string | number, rootData?: object | unknown[]): boolean | PromiseLike<T>;
  schema?: object | boolean;
  errors?: null | ErrorObject[];
  refs?: object;
  refVal?: unknown[];
  root?: ValidateFunction<T> | object;
  $async?: true;
  source?: object;
};

const ajv = new Ajv({ allErrors: true });

type RequestSchema = {
  properties?: object;
};

export function getSchema<T extends RequestSchema>(schemaName: keyof typeof Schema): T {
  return Schema[schemaName];
}

export function makeValidator<T>(schemaName: keyof typeof Schema): ValidateFunction<T> {
  const schema = Schema[schemaName];

  return ajv.compile(schema);
}

export function makeAlwaysValidValidator<T>(): ValidateFunction<T> {
  return (): boolean | PromiseLike<T> => true;
}

type ValidationResult<T> =
  | {
      valid: true;
      value: T;
    }
  | {
      valid: false;
      reasons: string[];
    };

export const isValid = <T>(validator: ValidateFunction<T>, obj?: unknown): ValidationResult<T> => {
  if (!obj) {
    return {
      valid: false,
      reasons: ['obj is undefined'],
    };
  }

  const valid = validator(obj as any) === true;
  if (valid) {
    return {
      valid: true,
      value: obj as T,
    };
  }

  return {
    valid: false,
    reasons: (validator.errors || []).map((error) => `${error.dataPath || '(root)'} ${error.message}`),
  };
};
