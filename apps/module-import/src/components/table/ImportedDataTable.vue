<template>
  <q-table
    :columns="columns"
    :rows="rows"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <template v-for="col in props.cols">
          <q-td
            :key="col.name"
            :props="props"
            v-if="col.name === 'error'"
            auto-width
          >
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="props.row.__expand = !props.row.__expand"
              :icon="props.row.__expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td
            :key="col.name"
            :props="props"
            v-else-if="col.name === 'delete'"
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
            :key="col.name"
            :props="props"
            v-else-if="col.name === 'status'"
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
            :key="col.name"
            :props="props"
            v-else
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
import {
  ImportedDataTableOutputs,
  ImportedDataTableProps,
} from '../../types/ImportedDataTable';
import { computed } from 'vue';
import { getModuleHostConfiguration } from '@linagora/linid-im-front-corelib';
import { ModuleImportOptions } from '../../types/moduleImport';
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
    align: 'left'
  })) ?? []),
]);
</script>

<style scoped></style>
