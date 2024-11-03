<template>
  <InboxTrackDrawer
    v-model:visible="visible"
    v-model:track="track"
    :authors="authors"
    :locations="locations"
    :errors="errors"
    @save="onSave"
    @start-processing="onStartProcessing"
  />
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue"
import { useAsyncState } from "@vueuse/core"
import { type InboxTrack } from "@lectorium/dal/models"
import {
  getAuthor, getDate, getLocation, getReferences,
  getTitle, InboxTrackDrawer
} from "@brahma/library/inbox"
import {
  useAuthorsService, useInboxTracksService, useLocationsService,
  useSourcesService,
} from "@brahma/shared"


/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */

const authorsService     = useAuthorsService()
const locationsService   = useLocationsService()
const sourcesService     = useSourcesService()
const inboxTracksService = useInboxTracksService()


/* -------------------------------------------------------------------------- */
/*                                  Interface                                 */
/* -------------------------------------------------------------------------- */

const props = defineProps<{
  trackId: string | undefined
}>()

const visible = defineModel<boolean>('visible', { required: true })


/* -------------------------------------------------------------------------- */
/*                                    State                                   */
/* -------------------------------------------------------------------------- */

const { state: authors }   = useAsyncState(getAuthors, [], { resetOnExecute: false })
const { state: locations } = useAsyncState(getLocations, [], { resetOnExecute: false })
const { trackId } = toRefs(props)

const track = ref<InboxTrack>({
  _id: '',
  trackId: '',
  source: '',
  title: { original: '', normalized: '' },
  date: { original: '', normalized: [] },
  author: { original: '', normalized: '' },
  location: { original: '', normalized: '' },
  references: [ { original: '', normalized: [] } ],
  extract_languages: [],
  translate_into: [],
  status: 'error'
})
const errors = ref<Record<string, { text: string; severity: 'warn' | 'error' }[]>>({})


/* -------------------------------------------------------------------------- */
/*                                    Hooks                                   */
/* -------------------------------------------------------------------------- */

watch(trackId, onTrackLoad)
watch(track, async (value: InboxTrack) => {
  errors.value.title = getTitle(value.title).annotations
  errors.value.date = getDate(value.date).annotations
  errors.value.author = (await getAuthor(authorsService, value.author)).annotations
  errors.value.location = (await getLocation(locationsService, value.location)).annotations
  errors.value.references = (await getReferences(sourcesService, value.references)).flatMap(x => x.annotations)
}, { deep: true, immediate: true })


/* -------------------------------------------------------------------------- */
/*                                  Handlers                                  */
/* -------------------------------------------------------------------------- */

async function onSave() {
  await save()
  visible.value = false
}

async function onStartProcessing() {
  await save("ready")
  visible.value = false
}

async function onTrackLoad(trackId: string | undefined) {
  if (!trackId) return
  errors.value = {}
  track.value = await getTrack(trackId)
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

async function getAuthors() {
  const authors = await authorsService.getAll()
  return authors.map(x => ({
    label: x.getName("en", "full"),
    value: x._id
  }))
}

async function getLocations() {
  const locations = await locationsService.getAll()
  return locations.map(x => ({
    label: x.getName("en"),
    value: x._id
  }))
}

async function getTrack(trackId: string) {
  const track = await inboxTracksService.getOne(trackId)
  if (!track.date.normalized) {
    // @ts-ignore
    track.date.normalized = [undefined, undefined, undefined]
  }
  return track
}

async function save(
  newStatus?: "new" | "error" | "ready" | "processing"
) {
  if (newStatus) {
    track.value.status = newStatus
  }

  if (track.value.date.normalized?.every(x => x === undefined)) {
    track.value.date.normalized = undefined
  }

  await inboxTracksService.updateOne(track.value._id, track.value)
}
</script>
