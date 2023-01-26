import React from 'react'
import ReactDOM from 'react-dom/client'
import PictureDateChanger from './PictureDateChanger.js'
import './main.scss'

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app')
  if (!appElement) throw new Error('App element not found')
  ReactDOM.createRoot(appElement).render(
    <React.StrictMode>
      <PictureDateChanger />
    </React.StrictMode>,
  )
})
