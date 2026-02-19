/*
 * Copyright (C) 2026 Linagora
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
 * LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
 * which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
 * of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
 * Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
 * sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
 * as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
 * and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
 * intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
 * <http://www.linagora.com/licenses/> for more details.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
 * LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
 * General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
 * LinID Identity Manager software.
 */

import type { LinidAttributeConfiguration } from '@linagora/linid-im-front-corelib';
import type { CommonComponentProps } from './common';

/**
 * Props for the AttributeField component.
 * Extends common component props with additional properties specific to entity attributes.
 */
export interface AttributeFieldProps<
  T = Record<string, unknown>,
> extends CommonComponentProps {
  /**
   * Identifier of the instance used for contextual data.
   */
  instanceId: string;
  /**
   * Configuration object defining the attribute.
   */
  definition: LinidAttributeConfiguration<T>;
  /**
   * The entity object containing current attribute values.
   * Used for binding and updating the form fields.
   */
  entity: Record<string, unknown>;
  /**
   * Indicates whether to bypass validation rules for this field.
   * When set to true, validation rules will not be applied.
   * @default false
   */
  ignoreRules?: boolean;
}

/**
 * Outputs (events) emitted by the EntityAttributeField component.
 */
export interface EntityAttributeFieldOutputs {
  /**
   * Emitted when the entity object is updated.
   *
   * Payload: the updated entity object.
   */
  'update:entity': [Record<string, unknown>];
}

/**
 * Settings related to attribute validation.
 */
export interface FieldSettings extends Record<string, unknown> {
  /**
   * Indicates whether to bypass validation rules for this field.
   * When set to true, validation rules will not be applied.
   */
  ignoreRules?: boolean;
}

/**
 * Settings for input number fields.
 */
export interface FieldNumberSettings extends FieldSettings {
  /**
   * Minimum value allowed for the input.
   */
  min?: number;
  /**
   * Maximum value allowed for the input.
   */
  max?: number;
}

/**
 * Settings for input text fields.
 */
export interface FieldTextSettings extends FieldSettings {
  /**
   * Minimum length allowed for the input.
   */
  minLength?: number;
  /**
   * Maximum length allowed for the input.
   */
  maxLength?: number;
  /**
   * Pattern that the input value must match.
   */
  pattern?: string;
}

/**
 * Settings for input date fields.
 */
export type FieldDateSettings = FieldSettings;

/**
 * Settings for input boolean fields.
 */
export type FieldBooleanSettings = FieldSettings;

/**
 * Settings for fields that allow selection from a predefined list of values.
 */
export interface FieldListSettings extends FieldSettings {
  /**
   * List of possible values for the field. The user must select one of these values.
   */
  values: string[];

  /**
   * Default value for the field. Must be one of the values defined in the `values` array.
   * @default values[0] first value in the `values` array
   */
  defaultValue?: string;
}
