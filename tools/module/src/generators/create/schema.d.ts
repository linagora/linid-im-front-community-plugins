/**
 * Schema for the create generator.
 */
export interface CreateGeneratorSchema {
  /**
   * The name of the module.
   */
  name: string;
  /**
   * A brief description of the module.
   */
  description: string;
  /**
   * The development server port.
   */
  port?: number;
}
