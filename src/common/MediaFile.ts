type ImageDataUri = string
type Iso8601DateTime = string

export interface MediaFile {
  path: string
  dataUri: ImageDataUri
  dateTime: Iso8601DateTime | null
}

export interface MediaFileWithDateTime extends MediaFile {
  dateTime: Iso8601DateTime
}
