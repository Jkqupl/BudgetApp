import { Link } from 'react-router';

function LoginPage() {
  return (
    <div className="text-3xl font-bold underline">
      <h1>Login</h1>
      <form>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <Link to="/dashboard">Login</Link>
      </form>
    </div>
  );
}

export default LoginPage;