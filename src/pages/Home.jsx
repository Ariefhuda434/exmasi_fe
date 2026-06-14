import { useState } from "react"
import Hero from "../components/sections/Hero"
import About from "../components/sections/About"
import Agenda from "../components/sections/Agenda"
import Tickets from "../components/sections/Tickets"
import Checkout from "../components/sections/Checkout"
import Gallery from "../components/sections/Gallery"
import FAQ from "../components/sections/FAQ"

export default function Home() {
  const [selectedPackage, setSelectedPackage] = useState('trio')

  return (
    <main className="min-h-screen bg-exBlack text-white">
      <Hero />
      <About />
      <Agenda />
      <Tickets onSelectPackage={setSelectedPackage} />
      <Checkout selectedPackage={selectedPackage} />
      <Gallery />
      <FAQ />
    </main>
  )
}