import React, { useState } from 'react'
import styled from 'styled-components'
import { Day } from 'src/common/Day'

const DayImage = styled.img`
  height: 100%;
  margin: 10px;
`

const DayImageRow = styled.div`
  display: flex;
  flex-direction: row;
  height: 15rem;
`

const DayRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
`

function DayRow({ day }: { day: Day}) {
  return <DayRowContainer>
    <h2>{day.date}</h2>
    <DayImageRow>
      {day.images.map(image =>
        <DayImage key={image.path} src={image.dataUri} />
      )}
    </DayImageRow>
  </DayRowContainer>
}


export default function PictureDateChanger() {
  const [days, setDays] = useState<Day[]>([])

  async function addImages() {
    console.log('Adding images...')
    const days = await window.pictureDateChangerAPI.addNewImages()
    console.info('New days', days)
    setDays(days)
  }

  function handleAddImagesClick() {
    addImages().catch(console.error)
  }

  return (
      <div>
        {days.map(day =>
          <DayRow key={day.date} day={day} />
        )}
        <h2></h2>
        <button onClick={handleAddImagesClick}>Add images</button>
      </div>
  )
}
