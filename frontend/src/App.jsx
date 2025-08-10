import React from 'react';
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from './components/Navbar';
import HomePage from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Explore from './components/Explore'
import Problems from './components/Problems'
import ProblemSolvePage from './components/IndivisualProblemPage';

// Placeholder components for pages to be created
const Playground = () => <div className="text-center text-white text-2xl pt-10">Playground</div>;
const Leaderboard = () => <div className="text-center text-white text-2xl pt-10">Leaderboard</div>;
const Profile = () => <div className="text-center text-white text-2xl pt-10">Profile</div>;

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:problemId" element={<ProblemSolvePage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
