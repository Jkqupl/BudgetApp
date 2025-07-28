import {Link} from 'react-router';


function HomePage() {
  return (
    <div>
      <h1>Welcome to Smart Budget</h1>
      <p>Your personal finance management tool.</p>
      <Link to = "/login" className="btn btn-primary"> Login/SignUp </Link>
    </div>
  );
}
export default HomePage;