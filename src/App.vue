<script setup lang="ts">
import StapelListe from "./ansichten/StapelListe.vue";
import { heuteIso } from "./domain/leitner";
import { useBestand } from "./speicher/bestand";

const heute = heuteIso();
const { bestand, zustand, fehlermeldung } = useBestand({ heute });
</script>

<template>
  <main class="seite">
    <h1>Lernkarten</h1>
    <p v-if="zustand === 'laden'">Lade Lernkarten …</p>
    <p v-else-if="zustand === 'fehler'" role="alert">{{ fehlermeldung }}</p>
    <StapelListe v-else-if="bestand" :stapel="bestand.stapel" :heute="heute" />
  </main>
</template>
