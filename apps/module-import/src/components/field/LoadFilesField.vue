<template>
  <q-file
    v-model="files"
    :label="t('import')"
    :loading="isLoading"
    multiple
  />
</template>

<script setup lang="ts">
import {
  LinidQBtnProps,
  LinidQCardProps,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import {
  LoadFileCardOutputs,
  LoadFileCardProps,
} from '../../types/LoadFileCard';
import { ref, watch } from 'vue';
import Papa from 'papaparse';
import { ImportedData } from '../../types/File';

const props = defineProps<LoadFileCardProps>();
const emit = defineEmits<LoadFileCardOutputs>();

const localUiNamespace = `${props.uiNamespace}.load-file-card`;
const { t } = useScopedI18n(`${props.i18nScope}.LoadFileCard`);
const { ui } = useUiDesign();

const files = ref<File[] | null>(null);
const isLoading = ref(false);
const uiProps = {
  card: ui<LinidQCardProps>(localUiNamespace, 'q-card'),
  button: ui<LinidQBtnProps>(localUiNamespace, 'q-btn'),
};

watch(
  files,
  async (list) => {
    if (!list.length) {
      return;
    }

    await loadFiles(list);
  },
  { deep: true }
);

function loadFiles(files: File[]): Promise<void> {
  isLoading.value = true;
  let id = 0;

  return Promise.all(files.map(parseCsv))
    .then((result: Record<string, unknown>[]) => {
      const data: ImportedData[] = result.flat().map((item) => ({
        __status: 'READY',
        __id: ++id,
        __expand: false,
        // TODO: keep only wanted column
        ...item,
      }));

      emit('update:data', data);
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function parseCsv(file: File, options = {}): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      ...options,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
</script>
<style scoped></style>
