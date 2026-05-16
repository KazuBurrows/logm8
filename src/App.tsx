import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Merchant from './pages/Merchant';
import Log from './pages/Log';
import NotFound from './pages/NotFound';
import CreateTag from './pages/CreateTag';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/merchant" element={<Merchant />} />
        <Route path="/log" element={<Log />} />
        {/* <Route path="/log/details" element={<LogDetail/>} /> */}
        <Route path="/tag/create" element={<CreateTag/>} />
        <Route path="/404" element={<NotFound/>} />
        {/* <Route path="/loading-screen" element={<LoadingScreen text={'Loading...'}/>} /> */}
        <Route path="/faq" element={<FAQ/>} />
        <Route path="/privacy" element={<Privacy/>} />
        <Route path="/admin" element={<Admin/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
