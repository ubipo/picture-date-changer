import React, { useState } from 'react'
import styled from 'styled-components'

const GridImage = styled.img`
  width: 100%;
  margin: 10px;
`

export default function ImageGrid() {
  const [imageBlobs, setImageBlobs] = useState<string[]>([])

  async function addImages() {
    const newBlobs = await window.pictureDateChangerAPI.addNewImages()
    console.info('New blobs', newBlobs)
    setImageBlobs(newBlobs)
  }

  function handleAddImagesClick() {
    addImages().catch(console.error)
  }

  return (
      <div>
        {imageBlobs.map((blob: string) =>
          // TODO: Proper key
          <GridImage key={blob.charAt(50) + blob.length} src={blob} />
        )}
        <h2></h2>
        <button onClick={handleAddImagesClick}>Add images</button>
      </div>
  )
}
