import React, { useState } from 'react';
import { Sidebar, useSidebar, Overlay, Button } from '@rewind-ui/core';
import { NavLink, Outlet } from 'react-router-dom';

function SideBarComponent() {
  const [expanded, setExpanded] = useState(true);
  const [mobile, setMobile] = useState(false);
  const sidebar = useSidebar();

  return (
    <div className="relative flex flex-row w-full h-full min-h-[35rem]">
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
        className={`transition-all transform duration-100 text-slate-700 flex w-full flex-col items-center ${
          expanded ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        {mobile && (
          <Overlay
            blur="none"
            onClick={() => {
              sidebar.toggleMobile();
            }}
            className="md:hidden z-40"
          />
        )}
        <header className="flex flex-row sticky top-0 px-8 items-center bg-white border-b border-b-gray-100 w-full shadow-sm min-h-[4rem]">
          <span>Navbar</span>

          <Button
            onClick={() => {
              sidebar.toggleMobile();
            }}
            size="sm"
            color="white"
            icon
            className="ml-auto flex md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
              <path d="M448 96c0-17.7-14.3-32-32-32H32C14.3 64 0 78.3 0 96s14.3 32 32 32H416c17.7 0 32-14.3 32-32zm0 320c0-17.7-14.3-32-32-32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32z" />
              <path
                className="opacity-50"
                d="M0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32z"
              />
            </svg>
          </Button>
        </header>

        <div className="w-full h-full p-8">
          <p>Dashboard</p>
        </div>

        <div className="flex sticky bottom-0 items-center bg-white w-full min-h-[4rem] px-8">
          <span>Footer</span>
        </div>
        <div className="w-full h-full p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SideBarComponent;