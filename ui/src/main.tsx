import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import PictureDateChanger from './PictureDateChanger.js'
import './main.scss'  
import { LocalizationProvider } from '@mui/x-date-pickers-pro'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app')
  if (!appElement) throw new Error('App element not found')
  ReactDOM.createRoot(appElement).render(
    <React.StrictMode>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PictureDateChanger />
      </LocalizationProvider>
    </React.StrictMode>
  )
})
