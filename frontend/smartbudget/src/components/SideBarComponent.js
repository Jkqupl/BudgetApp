import React, { useState } from 'react';
import { Sidebar, useSidebar, Overlay} from '@rewind-ui/core';
import { NavLink, Outlet } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import '../index.css';


function SideBarComponent() {
  const [expanded, setExpanded] = useState(true);
  const [mobile, setMobile] = useState(false);
  const sidebar = useSidebar();

  const navigate = useNavigate();
  const { signOut, session, userProfile, profileLoading } = UserAuth();

  const handlelogout = async (e) => {
    e.preventDefault();
    try{  
      await signOut();
      navigate('/');
    }catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const displayName = userProfile?.name || 'User';

  return (
    <div className="relative flex flex-row w-full h-screen">
      <Sidebar color="grey" shadow="sm"
        onToggle={(state) => {
          setExpanded(state.expanded);
          setMobile(state.mobile);
        }}
        className="absolute"
      >
        <Sidebar.Head>
          <Sidebar.Head.Title>
            <div className="flex items-center space-x-3 p-2">
              {/* Profile Picture */}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 flex-shrink-0">
                {userProfile?.profile_picture ? (
                  <img 
                    src={userProfile.profile_picture} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              {/* User Name - only show when expanded */}
              {expanded && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {profileLoading ? 'Loading...' : displayName}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </span>
                </div>
              )}
            </div>
          </Sidebar.Head.Title>
          <Sidebar.Head.Toggle />
        </Sidebar.Head>

    <Sidebar.Nav>
        <Sidebar.Nav.Section>
          <Sidebar.Nav.Section.Item
          as={({ className }) => (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Profile
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
              to="/goals"
              className={({ isActive }) =>
                `${className} ${isActive ? "active bg-gray-100" : ""}`
              }
            >
              Goals
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
          onClick = {handlelogout}
          label = "logout"/>
        
      </Sidebar.Nav.Section>

    </Sidebar.Nav>

        {/* <Sidebar.Footer>
          <div className="flex flex-col justify-center items-center text-sm">
            <span className="font-semibold">Rewind-UI</span>
            <span>version x.y.z</span>
          </div>
        </Sidebar.Footer> */}
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

    {/* <header className="flex flex-row sticky top-0 px-8 items-center bg-white border-b border-b-gray-100 w-full shadow-sm min-h-[4rem]">
      <span>Navbar</span>
    </header> */}

    <div className="w-full flex-1 p-8 overflow-auto">
      <Outlet />
    </div>
  </main>
    </div>
  );
}

export default SideBarComponent;