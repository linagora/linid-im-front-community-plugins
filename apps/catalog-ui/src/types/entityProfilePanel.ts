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
import type { FieldFormatter } from './ModuleGenericDetailsPageOptions';

/**
 * Configuration for DiceBear avatar generation.
 */
export interface AvatarOptions {
  /**
   * Array of Nunjucks templates rendered with `{ entity }` and joined to form the avatar seed.
   * Example: `["{{ entity.uid }}"]` or `["{{ entity.givenName }}", " ", "{{ entity.sn }}"]`.
   */
  seed: string[];
  /**
   * DiceBear style name, e.g. `"adventurer"`, `"bottts"`, `"lorelei"`.
   * Must match a style exported by `@dicebear/styles`.
   */
  style: string;
  /**
   * Style-specific options forwarded to DiceBear (backgroundColor, radius, etc.).
   */
  styleOptions?: Record<string, unknown>;
}

/**
 * Props for the EntityProfilePanel component.
 */
export interface EntityProfilePanelProps extends CommonComponentProps {
  /**
   * Identifier of the instance used for contextual data.
   */
  instanceId?: string;
  /**
   * Entity containing the profile information to display.
   * @default {}
   */
  entity?: Record<string, unknown>;
  /**
   * Path used by the back button to navigate to the parent page.
   * Passed through Nunjucks with a context containing `entity`, so it may contain template
   * expressions such as `{{ entity.groupId }}`; a plain string with no variables is also valid.
   * When unset, the back button is not rendered.
   */
  parentPath?: string;
  /**
   * Entity property key holding the status value forwarded to StatusBadge.
   * When absent, no status badge is rendered.
   * The badge is rendered inside the avatar section, so this key has no effect when `enableAvatar`
   * is false.
   */
  statusKey?: string;
  /**
   * Ordered list of the field names displayed in the entity details card.
   * The component does not forward `showRemainingFields` to EntityDetailsCard, so this list is
   * exhaustive: an entity attribute that is not listed is never displayed.
   */
  fieldOrder?: string[];
  /**
   * Formatters applied to specific entity attributes before display.
   */
  formatters?: FieldFormatter[];
  /**
   * Indicates whether the component is in a loading state.
   * When true, the attribute values of the details card are replaced with placeholders and the
   * edit button is disabled.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the navigation card section should be displayed on the page.
   * @default true
   */
  enableNavigation?: boolean;
  /**
   * Whether the avatar card section, containing image and status badge,
   * should be displayed on the page.
   * @default true
   */
  enableAvatar?: boolean;
  /**
   * DiceBear avatar generation options.
   * When provided, a deterministic avatar is generated locally from the entity using the configured
   * style and seed templates.
   * When absent, the avatar section shows no image.
   */
  avatarOptions?: AvatarOptions;
  /**
   * Whether the titles card section, containing title and subtitle,
   * should be displayed on the page.
   * @default true
   */
  enableTitles?: boolean;
  /**
   * Form fields rendered in the edition form dialog, defined as an array of
   * LinidAttributeConfiguration objects (see FormDialog).
   * Only used when `updateEndpoint` is set.
   * @default []
   */
  formFields?: LinidAttributeConfiguration[];
  /**
   * Endpoint used to update detail attributes.
   * The endpoint is a Nunjucks template rendered with a context containing `entity`, the entity
   * merged with the submitted form values.
   * When unset, the edit button is not rendered and the panel is read-only.
   */
  updateEndpoint?: string;
  /**
   * When set, the component emits an event with this key on `uiEventSubject` after a successful update.
   * Lets a hosting page react to a save, for example reloading its entity through the `reloadDetailsOn`
   * option of a details page.
   */
  emitOnUpdate?: string;
  /**
   * JSON payload sent as the update request body. Every nested string property is rendered as a Nunjucks
   * template with a context containing `entity`, the entity merged with the submitted form values —
   * so `{{ entity.email }}` resolves to the value typed in the `email` form field.
   * Only used when `updateEndpoint` is set. When omitted, FormDialogButton falls back to its empty
   * default body `{}`, which sends none of the submitted form values.
   */
  updateBody?: Record<string, unknown>;
}

/**
 * Outputs (events) emitted by the EntityProfilePanel component.
 */
export interface EntityProfilePanelOutputs {
  /**
   * Emitted when the entity object is updated.
   *
   * Payload: the updated entity object.
   */
  'update:entity': [Record<string, unknown>];
}
