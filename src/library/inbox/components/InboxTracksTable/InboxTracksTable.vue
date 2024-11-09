<template>
  <DataTable
    table-style="min-width: 50rem"
    paginator
    striped-rows
    data-key="code"
    show-gridlines
    removable-sort
    :value="rows"
    :rows="20"
    :rows-per-page-options="[20, 50]"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xl font-bold">Tracks</span>
        <Button
          icon="pi pi-refresh"
          rounded
          raised
          @click="emit('refresh')"
        />
      </div>
    </template>

    <!-- Title Column -->
    <Column
      field="title.value"
      header="Title"
      sortable
      style="width: 50%"
    >
      <template #body="{ data } : { data: InboxTrackRow }">
        <AnnotatedCell :annotations="data.title.annotations">
          {{ data.title.value }}
        </AnnotatedCell>
      </template>
    </Column>

    <!-- Date Column -->
    <Column
      field="date.value"
      header="Date"
      sortable
      style="width: 10%"
    >
      <template #body="{ data }: { data: InboxTrackRow }">
        <AnnotatedCell :annotations="data.date.annotations">
          {{ data.date.value }}
        </AnnotatedCell>
      </template>
    </Column>

    <!-- Author Column -->
    <Column
      field="author.value"
      header="Author"
      sortable
      style="width: 10%"
    >
      <template #body="{ data } : { data: InboxTrackRow }">
        <AnnotatedCell :annotations="data.author.annotations">
          {{ data.author.value }}
        </AnnotatedCell>
      </template>
    </Column>

    <!-- Location Column -->
    <Column
      field="location.value"
      header="Location"
      sortable
      style="width: 10%"
    >
      <template #body="{ data }">
        <AnnotatedCell :annotations="data.location.annotations">
          {{ data.location.value }}
        </AnnotatedCell>
      </template>
    </Column>

    <!-- References Column -->
    <Column
      field="references"
      header="References"
      style="width: 10%"
    >
      <template #body="{ data } : { data: InboxTrackRow }">
        <AnnotatedCell
          v-for="(reference, idx) of data.references"
          :key="idx"
          :value="reference"
          :annotations="reference.annotations"
        >
          <Tag
            class="mr-2"
            :severity="reference.annotations?.map(annotation => annotation.severity).includes('error') ? 'danger' : 'info'"
          >
            {{ reference.value }}
          </Tag>
        </AnnotatedCell>
      </template>
    </Column>

    <!-- Status Column -->
    <Column
      field="status"
      header="Status"
      sortable
      style="width: 10%"
    >
      <template #body="{ data } : { data: InboxTrackRow }">
        <Tag
          class="mr-2"
          :severity="getStatusSeverity(data.status)"
        >
          {{ data.status }}
        </Tag>
      </template>
    </Column>

    <!-- Action Buttons Column -->
    <Column class="w-24 !text-end">
      <template #body="{ data } : { data: InboxTrackRow }">
        <Button
          icon="pi pi-pencil"
          severity="secondary"
          rounded
          @click="emit('open', data.id)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import Button from "primevue/button"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import Tag from 'primevue/tag'
import AnnotatedCell from "./AnnotatedCell.vue"

/* -------------------------------------------------------------------------- */
/*                                  Interface                                 */
/* -------------------------------------------------------------------------- */

export type Annotation = {
  text: string
  severity: 'warn' | 'error'
}

export type AnnotatedValue = {
  value: string
  annotations: Annotation[]
}

export type InboxTrackRow = {
  id: string
  title: AnnotatedValue
  date: AnnotatedValue
  author: AnnotatedValue
  location: AnnotatedValue
  references: AnnotatedValue[]
  status: string
}

defineProps<{
  rows: InboxTrackRow[]
}>()

const emit = defineEmits<{
  open: [trackId: string]
  refresh: []
}>()


/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function getStatusSeverity(status: string): string {
  switch (status) {
  case 'error': return 'danger'
  case 'ready': return 'success'
  case 'processing': return 'warning'
  default: return 'info'
  }
}
</script>
