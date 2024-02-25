import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './Components/Homepage';
import BadgesPage from './Components/Badge/BadgesPage';
import RatingPage from './Components/Rating/RatingPage';
import ImageSelectorPage from './Components/ImageSelector/ImageSelectorPage';
import CardGameUIPage from './Components/CardGameUI/CardGameUIPage';


const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/badges" element={<BadgesPage />} />
      <Route path="/rating" element={<RatingPage />} />
      <Route path="/image_selector" element={<ImageSelectorPage />} />
      <Route path="/card_game" element={<CardGameUIPage />} />
    </Routes>
  </BrowserRouter>
);
