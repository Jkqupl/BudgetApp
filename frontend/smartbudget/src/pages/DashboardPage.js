import { UserAuth } from "../context/AuthContext";

function DashboardPage() {

      const {session} = UserAuth();
  
  return (
    <div>
      <h1>Welcome {session?.user?.email} to Smart Budget</h1>
      <p>This is the main page holding the dashboard</p>
      <p>Your personal finance management tool.</p>
    </div>
  );
}

export default DashboardPage;