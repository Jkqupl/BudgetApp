import React, { useState } from 'react';
import { Sidebar, useSidebar, Overlay, Button } from '@rewind-ui/core';
import { NavLink, Outlet } from 'react-router-dom';

function SideBarComponent() {
  const [expanded, setExpanded] = useState(true);
  const [mobile, setMobile] = useState(false);
  const sidebar = useSidebar();

  return (
    <div className="relative flex flex-row w-full h-screen">
      <Sidebar color="white" shadow="sm"
        onToggle={(state) => {
          setExpanded(state.expanded);
          setMobile(state.mobile);
        }}
        className="absolute"
      >
        <Sidebar.Head>
          <Sidebar.Head.Title>Rewind-UI</Sidebar.Head.Title>
          <Sidebar.Head.Toggle />
        </Sidebar.Head>

    <Sidebar.Nav>
        <Sidebar.Nav.Section>
          <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Home
            </NavLink>
          )}
        />
        </Sidebar.Nav.Section>

      <Sidebar.Nav.Section>
        <Sidebar.Nav.Section.Title>Budget Management</Sidebar.Nav.Section.Title>

        <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Dashboard
            </NavLink>
          )}
        />

        <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/income"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Income
            </NavLink>
          )}
        />

        <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Expenses
            </NavLink>
          )}
        />

        <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/budget"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Budget
            </NavLink>
          )}
        />

        <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              History
            </NavLink>
          )}
        />

      </Sidebar.Nav.Section>

      <Sidebar.Nav.Section>
        <Sidebar.Nav.Section.Title>Support</Sidebar.Nav.Section.Title>

        <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Logout
            </NavLink>
          )}
        />
      </Sidebar.Nav.Section>

    </Sidebar.Nav>

        <Sidebar.Footer>
          <div className="flex flex-col justify-center items-center text-sm">
            <span className="font-semibold">Rewind-UI</span>
            <span>version x.y.z</span>
          </div>
        </Sidebar.Footer>
      </Sidebar>

       <main
    className={`transition-all transform duration-100 text-slate-700 flex w-full flex-col items-center h-full ${
      expanded ? 'md:ml-64' : 'md:ml-20'
    }`}
  >
    {mobile && (
      <Overlay
        blur="none"
        onClick={() => sidebar.toggleMobile()}
        className="md:hidden z-40"
      />
    )}

    <header className="flex flex-row sticky top-0 px-8 items-center bg-white border-b border-b-gray-100 w-full shadow-sm min-h-[4rem]">
      <span>Navbar</span>
      {/* Toggle button */}
    </header>

    <div className="w-full flex-1 p-8 overflow-auto">
      <Outlet />
    </div>
  </main>
    </div>
  );
}

export default SideBarComponent;