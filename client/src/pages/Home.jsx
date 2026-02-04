import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Footer from '../components/Footer.jsx'
import AiTools from '../components/AiTools.jsx'
import Testimonial from '../components/Testimonials.jsx'
import Plans from '../components/Plans.jsx'

const Home = () => {
  return (
    <>
      <Hero />
      <AiTools />
      <Testimonial />
      <Plans />
    </>
  )
}

export default Home