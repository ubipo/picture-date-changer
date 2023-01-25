import React, { useEffect, useRef, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MediaFile, MediaFileWithDateTime } from 'src/common/MediaFile';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import { organizeMediaByDate, YearMedia } from './organizeMediaByDate';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import YearsScrollView from './components/YearsScrollView';
dayjs.extend(objectSupport)

export default function PictureDateChanger() {
  // These aliases cannot be moved to the top level of the file because the 
  // preload script is not yet loaded then
  const uiIpcApi = window.uiIpcApi
  const onUiIpcApiEvent = window.onUiIpcApiEvent

  const loadingBar = useRef<LoadingBarRef>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [yearsMedia, setYearsMedia] = useState<YearMedia[]>([])
  const [mediaWithoutDateTime, setMediaWithoutDateTime] = useState<MediaFile[]>([])

  useEffect(() => {
    onUiIpcApiEvent('mediaLoading', _e => {
      setStatus('Loading media...')
      loadingBar.current?.continuousStart()
    })
    onUiIpcApiEvent('mediaLoadingComplete', (e, newMedia) => {
      const mediaWithDateTime = newMedia.filter(mediaFile => mediaFile.dateTime != null) as MediaFileWithDateTime[]
      setYearsMedia(organizeMediaByDate(mediaWithDateTime))

      const mediaWithoutDateTime = newMedia.filter(mediaFile => mediaFile.dateTime == null)
      setMediaWithoutDateTime(mediaWithoutDateTime)

      setStatus(null)
      loadingBar.current?.complete()
    })
    onUiIpcApiEvent('mediaLoadingError', (e, message) => {
      setStatus(null)
      loadingBar.current?.complete()
      console.error('Error loading media files', message)
      toast('Error loading media files', { type: 'error' })
    })
  }, [])

  return (
    <main className='relative h-full'>
      <ToastContainer />
      <LoadingBar color='#f11946' ref={loadingBar} />
      <div className='flex flex-col h-full'>
        <div className='flex flex-row grow'>
          <section className='flex flex-row flex-wrap'>
            {mediaWithoutDateTime.map(mediaFile =>
              <img className='h-60' key={mediaFile.path} src={mediaFile.dataUri} />
            )}
          </section>
          { yearsMedia.length > 0
            ? <YearsScrollView yearsMedia={yearsMedia} />
            : <div className='flex-grow flex flex-col justify-center items-center'>
                <h1 className='text-4xl'>No media files</h1>
                <p className='text-xl'>Click the + button below to add media files</p>
              </div>
          }
        </div>
        {status && <section className='bg-slate-600 text-white p-[0.25em]'>{status}</section>}
      </div>
      <Fab
        sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
        color='primary'
        onClick={() => uiIpcApi.addMedia()}>
        <AddIcon fontSize='large' />
      </Fab>
    </main>
  )
}
