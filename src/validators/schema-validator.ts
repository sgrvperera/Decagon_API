import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

class SchemaValidator {
  private ajv: Ajv;
  private schemas: Map<string, ValidateFunction> = new Map();

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  loadSchema(schemaName: string): ValidateFunction {
    if (this.schemas.has(schemaName)) {
      return this.schemas.get(schemaName)!;
    }

    const schemaPath = path.resolve(__dirname, `schemas/${schemaName}.schema.json`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = this.ajv.compile(schema);
    this.schemas.set(schemaName, validate);
    
    return validate;
  }

  validate(schemaName: string, data: any): { valid: boolean; errors?: string[] } {
    const validate = this.loadSchema(schemaName);
    const valid = validate(data);

    if (!valid && validate.errors) {
      const errors = validate.errors.map(err => 
        `${err.instancePath} ${err.message}`
      );
      return { valid: false, errors };
    }

    return { valid: true };
  }
}

export const schemaValidator = new SchemaValidator();
