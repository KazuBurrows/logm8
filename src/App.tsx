import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import Merchant from './views/Merchant';
import Log from './views/Log';
import NotFound from './views/NotFound';
import CreateTag from './componets/CreateTag';
import FAQ from './views/FAQ';
import Privacy from './views/Privacy';

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
      </Routes>
    </Router>
  );
}

export default App;
