<script setup lang="ts">
import { ref } from "vue";
import StapelListe from "./ansichten/StapelListe.vue";
import { beispielBestand } from "./domain/beispiel";
import { heuteIso } from "./domain/leitner";
import type { Datenbestand } from "./domain/typen";

const heute = heuteIso();
// Startzustand: Beispieldaten im Speicher. Aufgabe C1 ersetzt das durch den gespeicherten Bestand.
const bestand = ref<Datenbestand>(beispielBestand(heute));
</script>

<template>
  <main class="seite">
    <h1>Lernkarten</h1>
    <StapelListe :stapel="bestand.stapel" :heute="heute" />
  </main>
</template>
