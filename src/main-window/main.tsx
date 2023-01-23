import React from 'react'
import ReactDOM from 'react-dom/client'
import ImageGrid from './ImageGrid.jsx'

window.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app')
    if (!appElement) throw new Error('App element not found')
    const root = ReactDOM.createRoot(appElement)
    root.render(<ImageGrid />)
})
