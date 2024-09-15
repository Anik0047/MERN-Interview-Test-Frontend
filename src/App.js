import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CanvasDrawing from './components/CanvasDrawing/CanvasDrawing';
import AllDrawings from './components/AllDrawings/AllDrawings';
import ViewDrawing from './components/ViewDrawing/ViewDrawing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CanvasDrawing />} />
        <Route path="/all-drawings" element={<AllDrawings />} />
        <Route path="/images/:id" element={<ViewDrawing />} />
      </Routes>
    </Router>
  );
}

export default App;
