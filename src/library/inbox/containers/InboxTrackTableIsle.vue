<template>
  <InboxTracksTable
    :rows="inboxTracks"
    @open="onTrackSelected"
    @refresh="onRefresh"
  />
</template>


<script setup lang="ts">
import { useAsyncState } from "@vueuse/core"
import {
  InboxTracksTable, type InboxTrackRow, getTitle, getDate,
  getAuthor, getLocation, getReferences
} from "@brahma/library/inbox"
import {
  useAuthorsService, useInboxTracksService, useLocationsService,
  useSourcesService, useSync,
} from "@brahma/shared"

/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */

const { sync }           = useSync()
const authorsService     = useAuthorsService()
const locationsService   = useLocationsService()
const inboxTracksService = useInboxTracksService()
const sourcesService     = useSourcesService()

/* -------------------------------------------------------------------------- */
/*                                  Interface                                 */
/* -------------------------------------------------------------------------- */

const emit = defineEmits<{
  open: [trackId: string]
}>()


/* -------------------------------------------------------------------------- */
/*                                    State                                   */
/* -------------------------------------------------------------------------- */

const { state: inboxTracks, execute } = useAsyncState<InboxTrackRow[]>(
  loadTableData, [], { immediate: true, resetOnExecute: false }
)

async function loadTableData(): Promise<InboxTrackRow[]> {
  try {
    const inboxTracks = await inboxTracksService.getMany({
      selector: {
        $or: [
          { archived: { "$exists": false } },
          { archived: false }
        ]
      }
    })

    const annotatedInboxTracks: InboxTrackRow[] = []

    for (const inboxTrack of inboxTracks) {
      annotatedInboxTracks.push({
        id: inboxTrack._id,
        title: getTitle(inboxTrack.title),
        date: getDate(inboxTrack.date),
        author: await getAuthor(authorsService, inboxTrack.author),
        location: await getLocation(locationsService, inboxTrack.location),
        references: await getReferences(sourcesService, inboxTrack.references),
        status: inboxTrack.status,
      })
    }
    return annotatedInboxTracks
  } catch (error) {
    console.error(error)
    return []
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Handlers                                  */
/* -------------------------------------------------------------------------- */

async function onTrackSelected(id: string) {
  emit('open', id)
}

async function onRefresh() {
  await sync()
  await execute()
}
</script>
