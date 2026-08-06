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
 * Props definition for the FormDialogButton component.
 *
 * This interface describes the configuration of an action button opening the shared form dialog,
 * collecting user input and sending it through a configurable HTTP request.
 */
export interface FormDialogButtonProps extends CommonComponentProps {
  /**
   * Identifier of the instance used for contextual data (e.g. API validation rules)
   * by the form dialog fields.
   */
  instanceId?: string;

  /**
   * Entity associated with the current context, provided to the Nunjucks context when rendering the
   * request URL and body, exposed as named parameters in the dialog title and content translations,
   * and used to pre-fill the form when `fillFormWithEntity` is enabled. Typically injected by the
   * zone hosting the component. May be null when the button is not attached to an entity.
   */
  entity?: Record<string, unknown> | null;

  /**
   * Parent of the entity associated with the current context, such as the application owning the
   * role targeted by the button, provided to the Nunjucks context when rendering the request URL
   * and body.
   */
  parent?: Record<string, unknown> | null;

  /**
   * Request URL, defined as a Nunjucks template rendered with a context containing `entity` (the
   * configured entity merged with the submitted form data) and `parent`.
   */
  url: string;

  /**
   * HTTP method used to send the request.
   * @default 'POST'
   */
  method?: 'POST' | 'PUT';

  /**
   * JSON payload sent as the request body. Every nested string property is rendered as a Nunjucks
   * template with a context containing `entity` (the configured entity merged with the submitted
   * form data) and `parent`.
   * @default {}
   */
  body?: Record<string, unknown>;

  /**
   * Form fields rendered in the form dialog, defined as an array of LinidAttributeConfiguration
   * objects (see FormDialog).
   */
  formFields: LinidAttributeConfiguration[];

  /**
   * Whether the form is pre-filled with the entity values when the dialog opens. Fields whose name
   * matches an entity property are initialized with the entity value, which is useful for PUT
   * edition use cases.
   * @default false
   */
  fillFormWithEntity?: boolean;
}

/**
 * Outputs (events) emitted by the FormDialogButton component.
 */
export interface FormDialogButtonOutputs {
  /**
   * Emitted with the response body returned by the API after a successful request.
   */
  submitted: [response: unknown];
}
