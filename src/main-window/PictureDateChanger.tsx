import React, { useEffect, useState } from 'react'
import { Days } from 'src/main-window/Days'
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MediaFile, MediaFileWithDateTime } from 'src/common/MediaFile';
import { onUiIpcApiEvent, uiIpcApi } from './uiIpc';
import dayjs from 'dayjs';

function DayRow({ date, mediaFiles }: { date: string, mediaFiles: MediaFile[] }) {
  return <div className='flex flex-col mb-2'>
    <h2>{date}</h2>
    <div className='flex flex-row h-60'>
      {mediaFiles.map(mediaFiles =>
        <img className='h-full' key={mediaFiles.path} src={mediaFiles.dataUri} />
      )}
    </div>
  </div>
}

export default function PictureDateChanger() {
  const [status, setStatus] = useState<string>('idle')
  const [days, setDays] = useState<Days>({})
  const [mediaWithoutDateTime, setMediaWithoutDateTime] = useState<MediaFile[]>([])


  function handleAddMediaFilesClick() {
    const addMediaPromise = uiIpcApi.addMedia().catch(err => {
      console.error(err)
      toast('Error adding media files', { type: 'error' })
    })
    setStatus('adding media...')
    addMediaPromise.then(() => setStatus('idle'))
  }

  useEffect(() => {
    onUiIpcApiEvent('mediaAdded', (e, newMedia) => {
      const mediaWithDateTime = newMedia.filter(mediaFile => mediaFile.dateTime != null) as MediaFileWithDateTime[]
      const newDays = mediaWithDateTime.reduce((days, mediaFile) => {
        const date = dayjs(mediaFile.dateTime).format('YYYY-MM-DD')
        const day = days[date] ?? []
        day.push(mediaFile)
        return { ...days, [date]: day}
      }, days)
      setDays(newDays)

      const mediaWithoutDateTime = newMedia.filter(mediaFile => mediaFile.dateTime == null)
      setMediaWithoutDateTime(mediaWithoutDateTime)
    })
  }, [])

  return (
    <main className='relative h-full'>
      <ToastContainer />
      <h1 className='text-3xl font-bold underline'>Picture Date Changer</h1>
      {Object.entries(days).map(([date, mediaFiles]) =>
        <DayRow key={date} date={date} mediaFiles={mediaFiles} />
      )}
      <Fab
        sx={{ position: 'absolute', bottom: '1rem', right: '1rem' }}
        color='primary'
        onClick={handleAddMediaFilesClick}>
        <AddIcon fontSize='large' />
      </Fab>
    </main>
  )
}
