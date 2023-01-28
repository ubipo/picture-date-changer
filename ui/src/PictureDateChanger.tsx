import { useEffect, useRef, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import { Fab } from '@mui/material'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { organizeMediaByDate, YearMedia } from './organizeMediaByDate';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import YearsScrollView from './components/YearsScrollView';
import { hostUiBridge } from './host-ui-bridge/index.js';
import { Media } from './host-ui-bridge/generated-bindings';
import { MediaWithDateTime } from './host-ui-bridge/extra-types.js';
import LazyMedia from './components/LazyMedia';

export default function PictureDateChanger() {
  const loadingBar = useRef<LoadingBarRef>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [yearsMedia, setYearsMedia] = useState<YearMedia[]>([])
  const [mediaWithoutDateTime, setMediaWithoutDateTime] = useState<Media[]>([])

  useEffect(() => {
    const listenerPromises = [
      hostUiBridge.on('mediaLoading', () => {
        setStatus('Loading media...')
        loadingBar.current?.continuousStart()
      }),
      hostUiBridge.on('mediaLoadingComplete', ({ newMedia }) => {
        console.log('Media loading complete', newMedia)
        const mediaWithDateTime = newMedia.filter(media => media.dateTime != null) as MediaWithDateTime[]
        setYearsMedia(organizeMediaByDate(mediaWithDateTime))

        const mediaWithoutDateTime = newMedia.filter(mediaFile => mediaFile.dateTime == null)
        setMediaWithoutDateTime(mediaWithoutDateTime)

        setStatus(null)
        loadingBar.current?.complete()
      }),
      hostUiBridge.on('mediaLoadingError', ({ message }) => {
        setStatus(null)
        loadingBar.current?.complete()
        console.error('Error loading media files', message)
        toast('Error loading media files', { type: 'error' })
      })
    ]
    hostUiBridge.emit('sendLatestMedia')
    return () => {
      listenerPromises.forEach(promise => promise.then(remover => remover()))
    }
  }, [])

  return (
    <main className='relative h-full'>
      <ToastContainer />
      <LoadingBar color='#f11946' ref={loadingBar} />
      <div className='flex flex-col h-full'>
        { yearsMedia.length > 0 || mediaWithoutDateTime.length > 0
          ? <div className='flex flex-row grow h-full'>
              <section className='flex flex-col overflow-auto h-full'>
                {mediaWithoutDateTime.map(mediaFile =>
                  <div className='h-60 flex justify-center' key={mediaFile.path}>
                    <LazyMedia media={mediaFile} />
                  </div>
                )}
              </section>
              { yearsMedia.length > 0
                ? <div><YearsScrollView yearsMedia={yearsMedia} /></div>
                : <div className='flex-grow flex flex-col justify-center items-center'>
                    <h2 className='text-4xl text-center'>No media files with date/time</h2>
                  </div>
              }
            </div>
          : <div className='flex-grow flex flex-col justify-center items-center'>
              <h2 className='text-4xl text-center'>No media files</h2>
              <p className='text-xl text-center'>Click the + button below to add media files</p>
            </div>
        }
        
        {status && <section className='bg-slate-600 text-white p-[0.25em]'>{status}</section>}
      </div>
      <Fab
        sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
        color='primary'
        onClick={() => hostUiBridge.emit('addMedia')}>
        <AddIcon fontSize='large' />
      </Fab>
    </main>
  )
}
