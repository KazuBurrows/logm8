import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { LoadingScreen } from './shared/components/LoadingScreen';

const Home = lazy(() => import('./features/home'));
const Merchant = lazy(() => import('./features/log/pages/Merchant'));
const Log = lazy(() => import('./features/log/pages/Log'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CreateTag = lazy(() => import('./features/log/pages/CreateTag'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Admin = lazy(() => import('./features/admin/pages/Admin'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingScreen text="Loading..." />}>
          <main>
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
              <Route path="*" element={<NotFound/>} />
            </Routes>
          </main>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
