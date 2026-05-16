import React, { useState } from 'react';
import { DEMO_CREDENTIALS } from '../db';
import { USERS } from '../data';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState(DEMO_CREDENTIALS[0].email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS[0].password);

  const submit = event => {
    event.preventDefault();
    onLogin({ email, password });
  };

  const fillCredentials = credential => {
    setEmail(credential.email);
    setPassword(credential.password);
  };

  return (
    <div className="login-screen">
      <form className="login-box" onSubmit={submit}>
        <div className="login-logo">Goal Setting &amp; Tracking Portal</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
          AtomQuest
        </div>
        <div className="login-sub">Sign in with your account</div>

        <label className="login-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="form-input login-input"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          autoComplete="username"
          required
        />

        <label className="login-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="form-input login-input"
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button className="btn btn-primary login-submit" type="submit">Sign in</button>

        <div className="demo-accounts">
          <div className="login-label">Demo accounts</div>
          {DEMO_CREDENTIALS.map(credential => {
            const user = USERS[credential.role];
            return (
              <button
                key={credential.email}
                className="role-btn"
                type="button"
                onClick={() => fillCredentials(credential)}
              >
                <div className="role-icon" style={{ background: user.color + '22', color: user.color }}>
                  {user.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                    {credential.email} / {credential.password}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </form>
    </div>
  );
}
