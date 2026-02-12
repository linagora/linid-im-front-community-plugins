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
    :columns="columns"
    :rows="rows"
  >
    <template #body="props">
      <q-tr :props="props">
        <template v-for="col in props.cols">
          <q-td
            v-if="col.name === 'error'"
            :key="col.name"
            :props="props"
            auto-width
          >
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              :icon="props.row.__expand ? 'remove' : 'add'"
              @click="props.row.__expand = !props.row.__expand"
            />
          </q-td>
          <q-td
            v-else-if="col.name === 'delete'"
            :key="col.name"
            :props="props"
            auto-width
          >
            <q-btn
              icon="delete"
              no-caps
              round
              size="sm"
              color="negative"
              @click="emit('delete:item', props.row.__id)"
            />
          </q-td>
          <q-td
            v-else-if="col.name === 'status'"
            :key="col.name"
            :props="props"
            auto-width
          >
            <q-badge
              outline
              color="primary"
            >
              <q-spinner-hourglass
                color="primary"
                class="q-mr-sm"
              />
              {{ props.row.__status }}
            </q-badge>
          </q-td>
          <q-td
            v-else
            :key="col.name"
            :props="props"
          >
            {{ props.row[col.field] }}
          </q-td>
        </template>
      </q-tr>

      <q-tr
        v-show="props.row.__expand"
        :props="props"
      >
        <q-td colspan="100%">
          <div class="text-left">
            This is expand slot for row above: {{ props.row.name }}.
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type {
  ImportedDataTableOutputs,
  ImportedDataTableProps,
} from '../../types/ImportedDataTable';
import { computed } from 'vue';
import { getModuleHostConfiguration } from '@linagora/linid-im-front-corelib';
import type { ModuleImportOptions } from '../../types/moduleImport';
import type { QTableColumn } from 'quasar';

const props = defineProps<ImportedDataTableProps>();
const emit = defineEmits<ImportedDataTableOutputs>();

const options = computed<ModuleImportOptions>(
  () =>
    getModuleHostConfiguration<ModuleImportOptions>(props.instanceId)!.options
);

const columns = computed<QTableColumn[]>(() => [
  { field: '__error', name: 'error', label: '', sortable: false },
  { field: '__id', name: 'delete', label: 'delete', sortable: false },
  { field: '__status', name: 'status', label: 'status', sortable: false },
  ...(options.value.csvHeaders?.map((header) => ({
    field: header,
    name: header,
    label: header,
    sortable: false,
    align: 'left',
  })) ?? []),
]);
</script>

<style scoped></style>
