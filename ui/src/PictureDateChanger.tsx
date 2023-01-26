import { useEffect, useRef, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { organizeMediaByDate, YearMedia } from './organizeMediaByDate';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import YearsScrollView from './components/YearsScrollView';
import { emitToHost, listenToHost } from './host-ui-bridge/index.js';
import { Media } from './host-ui-bridge/generated-bindings';
import { MediaWithDateTime } from './host-ui-bridge/extra-types.js';

export default function PictureDateChanger() {
  const loadingBar = useRef<LoadingBarRef>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [yearsMedia, setYearsMedia] = useState<YearMedia[]>([])
  const [mediaWithoutDateTime, setMediaWithoutDateTime] = useState<Media[]>([])

  useEffect(() => {
    listenToHost('mediaLoading', () => {
      setStatus('Loading media...')
      loadingBar.current?.continuousStart()
    })
    listenToHost('mediaLoadingComplete', ({ newMedia }) => {
      const mediaWithDateTime = newMedia.filter(media => media.dateTime != null) as MediaWithDateTime[]
      setYearsMedia(organizeMediaByDate(mediaWithDateTime))

      const mediaWithoutDateTime = newMedia.filter(mediaFile => mediaFile.dateTime == null)
      setMediaWithoutDateTime(mediaWithoutDateTime)

      setStatus(null)
      loadingBar.current?.complete()
    })
    listenToHost('mediaLoadingError', ({ message }) => {
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
        onClick={() => emitToHost('addMedia')}>
        <AddIcon fontSize='large' />
      </Fab>
    </main>
  )
}
