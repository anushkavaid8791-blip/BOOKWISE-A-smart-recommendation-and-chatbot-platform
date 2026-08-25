import Login from "./pages/Login";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Recommend from"./pages/Recommend";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;