import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import "./App.css";
import Courses from "./Pages/courses";
import Users from "./Pages/users";
import Assignments from "./Pages/assignments";
import Enrollments from "./Pages/enrollments"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Login />}></Route>
          {/* <Route path="/login" exact element={<Login />}></Route> */}
          <Route path="/register" exact element={<Register />}></Route>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="courses" element={<Courses />} />
            <Route path="users" element={<Users />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="enrollments" element={<Enrollments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
