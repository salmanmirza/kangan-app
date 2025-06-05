import React from "react";
import './App.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Courses from "./Pages/courses";
import Users from "./Pages/users";
import Assignments from "./Pages/assignments";
import Enrollments from "./Pages/enrollments";
import Unauthorized from "./Pages/unauthorized";
import Submissions from "./Pages/submissions"; // make sure this path matches your folder


import ProtectedRoute from "../components/protectedRoutesAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - all under /dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]} />
          }
        >
          {/* Shared dashboard landing */}
          <Route index element={<Dashboard />} />

          {/* These are for teacher/student */}
          <Route path="courses" element={<Courses />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="submissions" element={<Submissions />} />


          {/* Admin-only nested route for enrollments */}
          <Route
            path="enrollments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Enrollments />
              </ProtectedRoute>
            }
          />

          {/* Admin-only route for user management */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
