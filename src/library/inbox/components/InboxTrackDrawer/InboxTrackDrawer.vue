<template>
  <Drawer
    v-model:visible="visible"
    position="right"
    header="Edit Track"
    class="!w-full md:!w-80 lg:!w-[30rem]"
  >
    <div class="break-all">
      {{ track.source }}
    </div>

    <Divider />

    <div class="grid gap-6">
      <LanguageField
        id="extractLanguages"
        v-model:value="track.extract_languages"
        label="Extract languages"
        :errors="errors.extractLanguage"
      />

      <LanguageField
        id="translateInto"
        v-model:value="track.translate_into"
        label="Translate into"
        :errors="errors.translateInto"
      />

      <Divider />

      <TitleField
        v-model:title="track.title.normalized"
        :errors="errors.title"
      />

      <AuthorField
        v-model:author="track.author.normalized"
        :errors="errors.author"
        :authors="authors"
      />

      <LocationField
        v-model:location="track.location.normalized"
        :errors="errors.location"
        :locations="locations"
      />

      <DateField
        v-model:date="track.date.normalized"
        :errors="errors.date"
      />

      <ReferencesField
        :references="track.references.flatMap(x => x.original)"
        :errors="errors.references?.flatMap((ref) => ref || [])"
        @update:references="onReferencesUpdated"
      />
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <Button
          v-tooltip.top="'Save changes'"
          icon="pi pi-save"
          class="flex-auto"
          @click="onSaveClicked"
        />
        <Button
          v-tooltip.top="'Save changes and start processing'"
          label="Start processing"
          icon="pi pi-angle-double-right"
          class="flex-auto"
          fluid
          :disabled="hasErrors"
          @click="onStartProcessingClicked"
        />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { defineModel, computed } from "vue"
import Button from "primevue/button"
import Drawer from "primevue/drawer"
import Divider from "primevue/divider"
import TitleField from "./Fields/TitleField.vue"
import AuthorField from "./Fields/AuthorField.vue"
import LocationField from "./Fields/LocationField.vue"
import ReferencesField from "./Fields/ReferencesField.vue"
import DateField from "./Fields/DateField.vue"
import LanguageField from "./Fields/LanguageField.vue"
import { type  InboxTrack } from "@lectorium/dal/models"

/* -------------------------------------------------------------------------- */
/*                                  Interface                                 */
/* -------------------------------------------------------------------------- */

const props = defineProps<{
  authors:   { label: string; value: string }[]
  locations: { label: string; value: string }[]
  errors: Record<string, { text: string; severity: 'warn' | 'error' }[]>
}>()

const emit = defineEmits<{
  save: []
  startProcessing: []
}>()

const visible = defineModel<Boolean>("visible", { default: false })
const track = defineModel<InboxTrack>("track", { default: () => ({}) })

/* -------------------------------------------------------------------------- */
/*                                    State                                   */
/* -------------------------------------------------------------------------- */

const hasErrors = computed(() =>
  Object.keys(props.errors)
    .map(key => props.errors[key])
    .some((x) => x.some((y) => y.severity === "error"))
)


/* -------------------------------------------------------------------------- */
/*                                  Handlers                                  */
/* -------------------------------------------------------------------------- */

function onSaveClicked() {
  emit('save')
}

function onStartProcessingClicked() {
  emit('startProcessing')
}

function onReferencesUpdated(value: string[]) {
  // console.log(value)
  track.value.references = value.map((x) => ({
    original: x,
    normalized: x.split(/\s|\./)
  }))
}
</script>


