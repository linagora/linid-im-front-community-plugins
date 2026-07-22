<!--
  Copyright (C) 2026 Linagora

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
  Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
  any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
  LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
  which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
  of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
  Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
  sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
  as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
  and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
  intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
  <http://www.linagora.com/licenses/> for more details.

  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
  details.

  You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
  LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
  General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
  LinID Identity Manager software.
-->

<template>
  <q-table
    class="full-width generic-entity-table"
    data-cy="generic-entity-table"
    :columns="columns"
    :rows="rows"
    :row-key="props.rowKey"
    :rows-per-page-label="translateOrDefault('', 'rowsPerPage')"
    :no-data-label="t('noData')"
    :rows-per-page-options="[5, 7, 10, 15, 20, 25, 50]"
    :pagination-label="
      (firstRowIndex, endRowIndex, totalRowsNumber) =>
        translateOrDefault('', 'paginationLabel', {
          start: firstRowIndex,
          end: endRowIndex,
          total: totalRowsNumber,
        })
    "
    v-bind="uiProps"
  >
    <template
      v-for="name in forwardedSlotNames"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps"
      />
    </template>

    <template
      v-if="hasActionScope && !$slots.body"
      #body="bodyProps"
    >
      <q-tr
        :props="bodyProps"
        data-cy="entity-row"
      >
        <q-td
          v-for="col in bodyProps.cols"
          :key="col.name"
          :props="bodyProps"
          :data-cy="`entity-cell-${col.name}_${bodyProps.key}`"
        >
          <template v-if="col.name === 'table_actions'">
            <div
              class="flex justify-end q-gutter-x-sm generic-entity-table--actions"
              :data-cy="`entity-actions_${bodyProps.key}`"
            >
              <slot
                name="actions"
                :row="bodyProps.row"
                :row-key="bodyProps.key"
              />
            </div>
          </template>
          <template v-else>
            {{ col.value }}
          </template>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import {
  type LinidQTableProps,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, useSlots } from 'vue';
import type { GenericEntityTableProps } from '../../types/genericEntityTable';

/**
 * Name of the action scope rendered by the built-in body inside the actions column. It is consumed locally and must
 * not be forwarded to the underlying QTable.
 */
const ACTION_SCOPE_NAME = 'actions';

const props = withDefaults(defineProps<GenericEntityTableProps>(), {
  rowKey: 'id',
});
const { t, translateOrDefault } = useScopedI18n(
  `${props.i18nScope}.GenericEntityTable`
);

const { ui } = useUiDesign();
const slots = useSlots();

const uiProps = ui<LinidQTableProps>(
  `${props.uiNamespace}.generic-entity-table`,
  'q-table'
);

const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter((name) => name !== ACTION_SCOPE_NAME)
);

const hasActionScope = computed(() => Boolean(slots[ACTION_SCOPE_NAME]));
</script>
