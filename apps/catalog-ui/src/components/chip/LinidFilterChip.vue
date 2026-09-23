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
  <q-chip
    removable
    v-bind="uiProps.chip"
    :class="['linid-filter-chip', `linid-filter-chip--${filter.name}`]"
    :data-cy="`linid-filter-chip_${filter.name}`"
    @remove="emits('remove', filter.id)"
  >
    <q-avatar
      v-bind="uiProps.avatar"
      class="q-px-md linid-filter-chip--avatar"
    >
      {{ translateOrDefault(filter.name, 'type') }}
    </q-avatar>
    <template
      v-for="(value, index) in values"
      :key="`value_${index}`"
    >
      <em
        v-if="index > 0"
        class="q-mx-sm linid-filter-chip--separator"
      >
        {{ t('separator') }}
      </em>
      <q-spinner
        v-if="loading && !value.item"
        class="linid-filter-chip--loading"
        data-cy="linid-filter-chip_loading"
      />
      <span
        v-else
        class="linid-filter-chip--value"
      >
        {{ toLabel(value) }}
      </span>
    </template>
  </q-chip>
</template>

<script setup lang="ts">
import type {
  LinidFilterChipOutputs,
  LinidFilterChipProps,
} from '../../types/linidFilterChip';
import type {
  LinidFilterDynamicLabelOptions,
  LinidFilterValue,
  LinidQAvatarProps,
  LinidQChipProps,
} from '@linagora/linid-im-front-corelib';
import {
  getHttpClient,
  getNestedValue,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { onMounted, ref } from 'vue';

/** Status returned by the API when the response only holds a part of the matching items. */
const PARTIAL_CONTENT = 206;

const props = defineProps<LinidFilterChipProps>();
const emits = defineEmits<LinidFilterChipOutputs>();

const { t, te, translateOrDefault } = useScopedI18n(
  `${props.i18nScope}.LinidFilterChip.${props.filter.name}`
);
const { ui } = useUiDesign();
const { renderString } = useNunjucks();

const localUiNamespace = `${props.uiNamespace}.linid-filter-chip.${props.filter.name}`;

const uiProps = {
  avatar: ui<LinidQAvatarProps>(localUiNamespace, 'q-avatar'),
  chip: ui<LinidQChipProps>(localUiNamespace, 'q-chip'),
};

/**
 * Values of the filter, wrapped in a ref so that the items resolved asynchronously are written
 * back to the original `LinidFilterValue` instances and re-render the chip.
 */
const values = ref<LinidFilterValue[]>(props.filter.values);
const loading = ref(false);

/**
 * Builds the text displayed for a filter value.
 *
 * The resolved item is passed as the named parameters of the `value` translation key, so a message
 * such as `{name}` displays the `name` of the item. Only the top-level fields of the item can be
 * displayed: vue-i18n rejects dotted paths in a placeholder.
 * @param value - The filter value to display.
 * @returns The translated label, or the raw value when there is no item or no `value` key.
 */
function toLabel(value: LinidFilterValue): string {
  if (!value.item || !te('value')) {
    return value.value;
  }

  return t('value', value.item);
}

/**
 * Percent-encodes the query string of a rendered URL.
 *
 * The values are joined with the characters of the filter syntax — the `|` OR separator first of
 * all — which servers reject when they travel raw in a query string. Already encoded characters
 * are decoded then re-encoded, so a template escaping them itself stays correct.
 * @param url - The URL rendered from the configured template.
 * @returns The same URL, with its query string encoded.
 */
function encodeQueryString(url: string): string {
  const separatorIndex = url.indexOf('?');

  if (separatorIndex < 0) {
    return url;
  }

  const query = new URLSearchParams(url.slice(separatorIndex + 1));

  return `${url.slice(0, separatorIndex)}?${query.toString()}`;
}

/**
 * Extracts the items of a response body.
 * @param data - The response body.
 * @param path - Dot-notation path to the collection, when it is not the body itself.
 * @returns The items, or an empty array when the path resolves to anything else.
 */
function toItems(
  data: Record<string, unknown>,
  path?: string
): Record<string, unknown>[] {
  const items = path ? getNestedValue(data, path) : data;

  return Array.isArray(items) ? items : [];
}

/**
 * Assigns each returned item to the still unresolved value it matches.
 * @param items - Items returned by the API.
 * @param valuePath - Dot-notation path, within an item, to the attribute matching the value.
 */
function assignItems(
  items: Record<string, unknown>[],
  valuePath: string
): void {
  items.forEach((item) => {
    const match = values.value.find(
      (value) =>
        !value.item && String(getNestedValue(item, valuePath)) === value.value
    );

    if (match) {
      match.item = item;
    }
  });
}

/**
 * Resolves every unresolved value with a single request, following the next pages as long as the
 * API answers `206 Partial Content` and values are still missing an item.
 * @param options - Dynamic label configuration of the filter.
 * @returns A promise resolved once the items that could be retrieved have been assigned.
 */
async function resolveInOneRequest(
  options: LinidFilterDynamicLabelOptions
): Promise<void> {
  const url = encodeQueryString(
    renderString(options.url, {
      values: values.value
        .filter((value) => !value.item)
        .map((value) => value.value),
    })
  );
  let page = 0;
  let hasNextPage = true;

  while (hasNextPage && values.value.some((value) => !value.item)) {
    const response = await getHttpClient().get<Record<string, unknown>>(url, {
      params: { page },
    });
    const items = toItems(response.data, options.responseItemsPath);

    assignItems(items, options.valuePath ?? '');
    hasNextPage = response.status === PARTIAL_CONTENT && items.length > 0;
    page += 1;
  }
}

/**
 * Resolves each unresolved value with its own request, the whole response being the item.
 * @param options - Dynamic label configuration of the filter.
 * @returns A promise resolved once every request has settled.
 */
async function resolveOneRequestPerValue(
  options: LinidFilterDynamicLabelOptions
): Promise<void> {
  await Promise.allSettled(
    values.value
      .filter((value) => !value.item)
      .map(async (value) => {
        const response = await getHttpClient().get<Record<string, unknown>>(
          encodeQueryString(renderString(options.url, { value: value.value }))
        );

        value.item = response.data;
      })
  );
}

/**
 * Resolves the items missing from the filter values, as described by `dynamicLabelOptions`.
 *
 * Does nothing when the filter carries no such configuration or when every value already has an
 * item. Values that could not be resolved keep falling back to their raw value.
 * @returns A promise resolved once the resolution is over.
 */
async function resolveItems(): Promise<void> {
  const options = props.filter.dynamicLabelOptions;

  if (!options || !values.value.some((value) => !value.item)) {
    return;
  }

  loading.value = true;

  try {
    await (options.multipleRequests
      ? resolveOneRequestPerValue(options)
      : resolveInOneRequest(options));
  } catch {
    // Unresolved values fall back to their raw value, so a failed request is not worth reporting.
  } finally {
    loading.value = false;
  }
}

onMounted(resolveItems);
</script>

<style scoped lang="scss">
em {
  font-style: italic;
  color: #888;
}
.q-avatar {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  width: auto;
}
</style>
