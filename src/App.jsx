import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Login />}></Route>
          {/* <Route path="/login" exact element={<Login />}></Route> */}
          {/* <Route path="/register" exact element={<Register />}></Route> */}
          <Route path="/dashboard" exact element={<Dashboard />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
