import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CreateServerModal, CreateServerForm } from './features/server'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function TestCreateServer() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-10 w-full min-h-screen bg-[#313338] text-white">
      <div className="mb-4">
        <Link to="/" className="text-blue-400 hover:underline mb-4 inline-block">&larr; Back to Home</Link>
        <h1 className="text-2xl font-bold">Preview: Create Server Feature</h1>
      </div>
      
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 rounded text-white font-bold transition-colors"
      >
        Open Create Server Modal
      </button>

      <CreateServerModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <CreateServerForm 
          onSuccess={() => {
            alert("✅ Created successfully! Check serverStore (or console).");
            setIsOpen(false);
          }} 
          onCancel={() => setIsOpen(false)} 
        />
      </CreateServerModal>
    </div>
  )
}

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <div className="my-5 p-4 border border-dashed border-[#5865F2] inline-block rounded bg-[#2B2D31]">
            <strong className="text-white block mb-2">⭐ LiveBox Features Preview:</strong>
            <Link to="/test/create-server" className="text-[#5865F2] hover:text-[#4752C4] underline font-bold text-lg">
              &rarr; Test Create Server Modal
            </Link>
          </div>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/create-server" element={<TestCreateServer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
