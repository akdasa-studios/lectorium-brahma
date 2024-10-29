import { useDatabase } from "@brahma/shared"

export function useSync() {
  const database = useDatabase()

  async function sync() {
    await database.local.dictionary.replicateFrom(database.remote.dictionary)
    await database.local.inboxTracks.sync(database.remote.inboxTracks)
  }

  return { sync }
}