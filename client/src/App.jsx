import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Community from './pages/Community.jsx'
import GenerateDescription from './pages/GenerateDescription.jsx'
import GenerateScript from './pages/GenerateScript.jsx'
import GenerateThumbnails from './pages/GenerateThumbnails.jsx'
import GenerateTitle from './pages/GenerateTitle.jsx'
import Layout from './pages/Layout.jsx'

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* App layout */}
      <Route path="/ai" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="community" element={<Community />} />
        <Route path="generate-description" element={<GenerateDescription />} />
        <Route path="generate-script" element={<GenerateScript />} />
        <Route path="generate-thumbnails" element={<GenerateThumbnails />} />
        <Route path="generate-title" element={<GenerateTitle />} />
      </Route>
    </Routes>
  )
}


export default App
