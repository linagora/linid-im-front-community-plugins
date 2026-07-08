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

import type {
  DialogEvent,
  LinidAttributeConfiguration,
} from '@linagora/linid-im-front-corelib';

/**
 * Enum used to identify the type of dialog.
 */
export enum DialogKey {
  /**
   * Represents a confirmation dialog.
   */
  Confirmation = 'confirmation',
  /**
   * Represents a form dialog.
   */
  Form = 'form',
}

/**
 * Base interface for dialog events, containing common properties for both confirmation and form dialogs.
 */
interface BaseDialogEvent extends DialogEvent {
  /**
   * Title of the dialog.
   */
  title?: string;

  /**
   * Descriptive message shown in the dialog. (HTML supported).
   */
  content?: string;
}

/**
 * Dialog event for user confirmations.
 */
export interface ConfirmationDialogEvent extends BaseDialogEvent {
  /**
   * Callback triggered when the user confirms.
   * Must return a Promise (e.g., to handle async logic like API calls).
   */
  onConfirm?: () => Promise<void>;
}

/**
 * Dialog event for forms, allowing to specify form data and a submit callback.
 */
export interface FormDialogEvent extends BaseDialogEvent {
  /**
   * Identifier of the instance used for contextual data (e.g. API validation rules).
   */
  instanceId?: string;

  /**
   * Form fields to be rendered in the dialog, defined as an array of LinidAttributeConfiguration objects.
   */
  formFields?: LinidAttributeConfiguration[];

  /**
   * Initial form data to populate the form fields, defined as a record of key-value pairs where keys are
   * field names and values are the corresponding initial values. This allows the form to be pre-filled
   * with existing data when the dialog is opened.
   */
  initialFormData?: Record<string, unknown>;

  /**
   * Callback triggered when the form is submitted, receiving the form data as a record of key-value pairs.
   * @param formData - An object containing the submitted form data, where keys are field names and values are the corresponding user inputs.
   * @returns A Promise that resolves when the form submission handling is complete (e.g., after performing API calls or other async operations).
   * The Promise **must reject** (or re-throw) to signal failure — for example, after displaying an error notification.
   * If the Promise resolves, the dialog considers the submission successful and closes.
   */
  onSubmit?: (formData: Record<string, unknown>) => Promise<void>;

  /**
   * Callback triggered after the form dialog closes, whether by submission or cancellation.
   */
  afterClose?: () => void;
}
