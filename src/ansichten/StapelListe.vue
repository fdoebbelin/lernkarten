<script setup lang="ts">
import { faelligeKarten } from "../domain/leitner";
import type { Stapel } from "../domain/typen";

defineProps<{ stapel: Stapel[]; heute: string }>();
</script>

<template>
  <ul class="stapel-liste">
    <li v-for="eintrag in stapel" :key="eintrag.id" class="stapel">
      <span class="stapel-name">{{ eintrag.name }}</span>
      <span class="stapel-zahlen">
        {{ faelligeKarten(eintrag, heute).length }} fällig von {{ eintrag.karten.length }}
      </span>
    </li>
  </ul>
</template>
