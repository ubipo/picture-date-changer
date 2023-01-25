import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MediaFile, MediaFileWithDateTime } from 'src/common/MediaFile';
import { onUiIpcApiEvent, uiIpcApi } from './uiIpc';
import dayjs, { Dayjs } from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import { organizeMediaByDate, YearMedia } from './organizeMediaByDate';
dayjs.extend(objectSupport)

function DayRow({ date, mediaFiles }: { date: Dayjs, mediaFiles: MediaFile[] }) {
  return <div className='flex flex-col mb-2 overflow-auto'>
    <h4>{dayjs(date).format('ddd, DD MMM YYYY')}</h4>
    <div className='flex flex-row h-60'>
      {mediaFiles.map(mediaFiles =>
        <img className='h-full' key={mediaFiles.path} src={mediaFiles.dataUri} />
      )}
    </div>
  </div>
}

export default function PictureDateChanger() {
  const [status, setStatus] = useState<string | null>(null)
  const [yearsMedia, setYearsMedia] = useState<YearMedia[]>([])
  const [mediaWithoutDateTime, setMediaWithoutDateTime] = useState<MediaFile[]>([])


  function handleAddMediaFilesClick() {
    const addMediaPromise = uiIpcApi.addMedia().catch(err => {
      console.error(err)
      toast('Error adding media files', { type: 'error' })
    })
    setStatus('Adding media...')
    addMediaPromise.then(() => setStatus(null))
  }

  useEffect(() => {
    onUiIpcApiEvent('mediaAdded', (e, newMedia) => {
      const mediaWithDateTime = newMedia.filter(mediaFile => mediaFile.dateTime != null) as MediaFileWithDateTime[]
      setYearsMedia(organizeMediaByDate(mediaWithDateTime))

      const mediaWithoutDateTime = newMedia.filter(mediaFile => mediaFile.dateTime == null)
      setMediaWithoutDateTime(mediaWithoutDateTime)
    })
  }, [])

  return (
    <main className='relative h-full'>
      <ToastContainer />
      <div className='flex flex-col h-full'>
        <div className='flex flex-row grow'>
          <section className='flex flex-row flex-wrap'>
            {mediaWithoutDateTime.map(mediaFile =>
              <img className='h-60' key={mediaFile.path} src={mediaFile.dataUri} />
            )}
          </section>
          <section className='m-2 mr-0'>
            {yearsMedia.map(({ year, months }) =>
              <section key={year}>
                <h2>{year}</h2>
                {months.map(({ month, days }) =>
                  <section key={month}>
                    <h3>{dayjs({ month }).format('MMMM')}</h3>
                    {days.map(({ day, media }) =>
                      <DayRow key={day}
                              date={dayjs({ year, month, day })}
                              mediaFiles={media} />
                    )}
                  </section>
                )}
              </section>
            )}
          </section>
        </div>
        {status && <section className='bg-slate-600 text-white p-[0.25em]'>{status}</section>}
      </div>
      <Fab
        sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
        color='primary'
        onClick={handleAddMediaFilesClick}>
        <AddIcon fontSize='large' />
      </Fab>
    </main>
  )
}
