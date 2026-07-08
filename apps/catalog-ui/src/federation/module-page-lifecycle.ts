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
  ModuleHostConfig,
  ModuleLifecycleResult,
} from '@linagora/linid-im-front-corelib';
import {
  BasicRemoteModule,
  getI18nInstance,
  useLinidUiStore,
  useLinidZoneStore,
} from '@linagora/linid-im-front-corelib';
import type { ModulePageOptions } from '../types/ModulePageOptions';
import type { ComposerTranslation } from 'vue-i18n';

/**
 * Remote module responsible for page integration.
 *
 * This module acts as a federated entry point for a generic page and is
 * responsible for integrating it into the host application.
 *
 * It extends {@link BasicRemoteModule} to inherit the standard metadata and
 * lifecycle behavior expected by the host application.
 */
class ModulePage extends BasicRemoteModule<ModulePageOptions> {
  /**
   * Creates a new page module instance.
   *
   * Registers the module metadata used by the host application, including
   * its identifier, display name, version, and description.
   */
  constructor() {
    super(
      'modulePage',
      'Page module',
      '0.0.1',
      'Module to manage page entity.'
    );
  }

  /**
   * Performs post-initialization tasks for the page module.
   *
   * Once the module has been initialized, it registers an entry in the host
   * application's main navigation menu using the configured module path and
   * localized label.
   * @param config - The configuration object provided by the host application.
   * @returns A promise that resolves to the result of the module lifecycle operation.
   */
  override async postInit(
    config: ModuleHostConfig<ModulePageOptions>
  ): Promise<ModuleLifecycleResult> {
    const uiStore = useLinidUiStore();
    const linidZoneStore = useLinidZoneStore();
    const t = getI18nInstance().global.t as ComposerTranslation;

    uiStore.addMainNavigationMenuItems({
      id: config.instanceId,
      label: t(`${config.instanceId}.NavigationMenu.label`),
      path: config.basePath,
    });

    linidZoneStore.registerOnce('base-layout.dialogComponent', {
      plugin: 'catalogUI/ConfirmationDialog',
    });

    linidZoneStore.registerOnce('base-layout.dialogComponent', {
      plugin: 'catalogUI/FormDialog',
    });

    return { success: true };
  }
}

export default new ModulePage();
