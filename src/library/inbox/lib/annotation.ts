import type { AuthorsService, LocationsService, SourcesService } from "@lectorium/dal/index"
import type { NormalizedValue } from "@lectorium/dal/models"

type Annotation = {
  text: string
  severity: 'warn' | 'error'
}

type AnnotatedValue = {
  value: string
  annotations: Annotation[]
}


export function getTitle(
  title: NormalizedValue<string>
): AnnotatedValue {
  const annotations: Annotation[] = []

  if (!title.normalized) {
    annotations.push({ text: 'Title is empty', severity: 'error' })
  } else if (title.normalized.length < 5) {
    annotations.push({ text: 'Title is too short', severity: 'warn' })
  }

  return {
    value: title.normalized || title.original || 'Empty',
    annotations: annotations
  }
}


export async function getAuthor(
  authorsService: AuthorsService,
  author: NormalizedValue<string>
): Promise<AnnotatedValue> {
  let authorNameView = undefined
  const annotations: Annotation[] = []

  if (!author.normalized) {
    annotations.push({ text: 'Author is not found', severity: 'error' })
  } else {
    try {
      const record = await authorsService.getOne(author.normalized)
      authorNameView = record.getName("en", "short")
    } catch (error) {
      annotations.push({ text: `Author is not found by id "${author.normalized}"`, severity: 'error' })
    }
  }

  return { value: authorNameView || author.original || 'Empty', annotations }
}


export async function getLocation(
  locationsService: LocationsService,
  location: NormalizedValue<string>
): Promise<AnnotatedValue> {
  let locationNameView = undefined
  const annotations: Annotation[] = []

  if (!location.normalized) {
    annotations.push({ text: 'Location is empty', severity: 'warn' })
  } else {
    try {
      const record = await locationsService.getOne(location.normalized)
      locationNameView = record.getName("en")
    } catch (error) {
      annotations.push({ text: 'Location is not found', severity: 'error' })
    }
  }

  return {
    value: locationNameView || location.original || 'Empty',
    annotations: annotations
  }
}

export function getDate(
  date: NormalizedValue<number[]>
): AnnotatedValue {
  const annotations: Annotation[] = []

  if (!date.normalized) {
    annotations.push({ text: 'Date is not found', severity: 'warn' })
  } else if (
    date.normalized.some(x => x === undefined || x === null) ||
      date.normalized.length !== 3
  ) {
    annotations.push({ text: 'Date is incomplete', severity: 'warn' })
  } else {
    const parsedDate = new Date(`${date.normalized[0]}-${date.normalized[1]}-${date.normalized[2]}`)
    const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    if (!isValidDate) {
      annotations.push({ text: 'Date is invalid', severity: 'error' })
    }
  }

  return {
    value: date.normalized?.join("-") || date.original || 'Empty',
    annotations: annotations
  }
}


export async function getReferences(
  sourcesService: SourcesService,
  references: NormalizedValue<(string | number)[]>[]
): Promise<AnnotatedValue[]> {
  const result: AnnotatedValue[] = []

  if (!references || references.length === 0) {
    result.push({
      value: 'Empty',
      annotations: [{ text: 'No references', severity: 'warn' }]
    })
  }

  for (const reference of references) {
    const reference_result: AnnotatedValue = {
      value: reference.original || 'Empty',
      annotations: [],
    }

    if (!reference.normalized) {
      reference_result.annotations.push({ text: 'References is not found', severity: 'error' })
    } else {
      try {
        const book = reference.normalized[0].toString().toLowerCase()
        const numbers = reference.normalized.slice(1).join('.')
        const record = await sourcesService.getOne(book)
        reference_result.value = record.getName("en", "short") + ' ' + numbers
      } catch {
        reference_result.annotations.push({ text: `Reference is not found by id "${reference.normalized[0]}"`, severity: 'error' })
      }
    }

    result.push(reference_result)
  }

  return result
}
