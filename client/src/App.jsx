import React from 'react'
import { Route, Routes, Outlet } from 'react-router-dom'

import Navbar from './components/Navbar.jsx' 
import Footer from './components/Footer.jsx' 

import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Community from './pages/Community.jsx'
import GenerateDescription from './pages/GenerateDescription.jsx'
import GenerateScript from './pages/GenerateScript.jsx'
import GenerateThumbnails from './pages/GenerateThumbnails.jsx'
import GenerateTitle from './pages/GenerateTitle.jsx'
import Contact from './pages/Contact.jsx'
import Layout from './pages/Layout.jsx'
import About from './pages/About.jsx'
import ViewCreation from './pages/ViewCreation.jsx'

const App = () => {
  return (
    <>
      <Routes>
        
        {/* --- PUBLIC ROUTES WRAPPER --- */}
        <Route element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            
            {/* ADDED pt-24 HERE to push content below the fixed Navbar */}
            <main className="grow"> 
              <Outlet /> 
            </main>
            
            <Footer />
          </div>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/view/:id" element={<ViewCreation />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* --- AI/DASHBOARD ROUTES --- */}
        <Route path="/ai" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="community" element={<Community />} />
          <Route path="generate-description" element={<GenerateDescription />} />
          <Route path="generate-script" element={<GenerateScript />} />
          <Route path="generate-thumbnails" element={<GenerateThumbnails />} />
          <Route path="generate-title" element={<GenerateTitle />} />
        </Route>

      </Routes>
    </>
  )
}

export default App