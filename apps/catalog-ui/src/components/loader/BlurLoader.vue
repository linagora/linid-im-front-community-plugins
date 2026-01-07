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
  <div :class="['blur-box', widthClass, heightClass, primaryClass]" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: String,
    default: 'md',
    validator: (val: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
  },
  height: {
    type: String,
    default: 'md',
    validator: (val: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val),
  },
  primary: {
    type: Boolean,
    default: false,
  },
});

const widthClass = computed(() => {
  return {
    xs: 'blur-loader--width-xs',
    sm: 'blur-loader--width-sm',
    md: 'blur-loader--width-md',
    lg: 'blur-loader--width-lg',
    xl: 'blur-loader--width-xl',
  }[props.width];
});

const heightClass = computed(() => {
  return {
    xs: 'blur-loader--height-xs',
    sm: 'blur-loader--height-sm',
    md: 'blur-loader--height-md',
    lg: 'blur-loader--height-lg',
    xl: 'blur-loader--height-xl',
  }[props.height];
});

const primaryClass = computed(() => {
  return props.primary ? 'blur-loader--primary' : '';
});
</script>

<style lang="scss" scoped>
.blur-box {
  height: 1.25rem;
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: shimmer 1.5s infinite ease-in-out;
  }
}

.blur-loader--primary {
  background-color: rgba(255, 255, 255, 0.15);

  &::after {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
  }
}

.blur-loader--width-xs {
  width: 25px;
}

.blur-loader--width-sm {
  width: 50px;
}

.blur-loader--width-md {
  width: 100px;
}

.blur-loader--width-lg {
  width: 150px;
}

.blur-loader--width-xl {
  width: 300px;
}

.blur-loader--height-xs {
  height: 0.75rem;
}

.blur-loader--height-sm {
  height: 1rem;
}

.blur-loader--height-md {
  height: 1.25rem;
}

.blur-loader--height-lg {
  height: 2rem;
}

.blur-loader--height-xl {
  height: 2.5rem;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}
</style>
