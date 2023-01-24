import React, { useState } from 'react'
import { Day } from 'src/common/Day'
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material'

function DayRow({ day }: { day: Day}) {
  return <div className='flex flex-col mb-2'>
    <h2>{day.date}</h2>
    <div className='flex flex-row h-60'>
      {day.images.map(image =>
        <img className='h-full' key={image.path} src={image.dataUri} />
      )}
    </div>
  </div>
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
    <main className='relative h-full'>
      <h1 className='text-3xl font-bold underline'>Picture Date Changer</h1>
      {days.map(day =>
        <DayRow key={day.date} day={day} />
      )}
      <Fab
        sx={{ position: 'absolute', bottom: '1rem', right: '1rem' }}
        color='primary'
        onClick={handleAddImagesClick}>
        <AddIcon fontSize='large' />
      </Fab>
    </main>
  )
}
