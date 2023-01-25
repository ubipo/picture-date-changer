import React from 'react'
import ReactDOM from 'react-dom/client'
import PictureDateChanger from './PictureDateChanger.js'
import './index.scss'
import { registerUiIpcApi } from './uiIpc.js'

window.addEventListener('DOMContentLoaded', () => {
    registerUiIpcApi()
    const appElement = document.getElementById('app')
    if (!appElement) throw new Error('App element not found')
    const root = ReactDOM.createRoot(appElement)
    root.render(<PictureDateChanger />)
})
