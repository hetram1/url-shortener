import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import {
  clearAccessToken,
  getCurrentUser,
  login,
  register,
  saveAccessToken,
} from "./api/auth";
import type { User } from "./api/auth";
import { createUrl, getUrls } from "./api/urls";
import type { ShortUrl } from "./api/urls";

type AuthMode = "login" | "register";

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [createdUrl, setCreatedUrl] = useState<ShortUrl | null>(null);
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        setUrlsLoading(true);

        try {
          const userUrls = await getUrls();
          setUrls(userUrls);
        } finally {
          setUrlsLoading(false);
        }
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    }

    void restoreSession();
  }, []);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (authMode === "register") {
        await register(email, password);
        setMessage("Account created. You can now log in.");
        setAuthMode("login");
        setPassword("");
        return;
      }

      const response = await login(email, password);

      saveAccessToken(response.accessToken);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setMessage("");

      setUrlsLoading(true);

      try {
        const userUrls = await getUrls();
        setUrls(userUrls);
      } finally {
        setUrlsLoading(false);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setCreatedUrl(null);
    setLoading(true);

    try {
      const shortUrl = await createUrl(originalUrl, customAlias);
      setCreatedUrl(shortUrl);
      setUrls((currentUrls) => [shortUrl, ...currentUrls]);
      setOriginalUrl("");
      setCustomAlias("");
      setMessage("Short URL created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAccessToken();
    setUser(null);
    setEmail("");
    setPassword("");
    setMessage("");
    setUrls([]);
    setCreatedUrl(null);
  }

  if (authChecking) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Shortly</h1>
          <p>Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="app">
        <header className="topbar">
          <div>
            <h1>Shortly</h1>
            <p>URL Shortener</p>
          </div>

          <div className="user-area">
            <span>{user.email}</span>
            <button className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>

        <main className="dashboard">
          <section className="hero">
            <p className="eyebrow">URL MANAGEMENT</p>
            <h2>Create and manage your short links</h2>
            <p className="hero-text">
              Turn long URLs into short, shareable links and track their
              performance.
            </p>
          </section>

          <section className="create-card">
            <div className="section-heading">
              <div>
                <h3>Create a short URL</h3>
                <p>
                  Paste a destination URL to generate a short link.
                </p>
              </div>
            </div>

            <form className="url-form" onSubmit={handleCreateUrl}>
              <label>
                Destination URL
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(event) => setOriginalUrl(event.target.value)}
                  placeholder="https://example.com/very-long-url"
                  required
                />
              </label>

              <label>
                Custom alias <span>(optional)</span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(event) => setCustomAlias(event.target.value)}
                  placeholder="my-link"
                />
              </label>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create short URL"}
              </button>

              {message && <p className="form-message">{message}</p>}

              {createdUrl && (
                <div className="created-url">
                  <span>Your short URL</span>
                  <a
                    href={`http://localhost:3001/${createdUrl.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    http://localhost:3001/{createdUrl.shortCode}
                  </a>
                </div>
              )}
            </form>
          </section>

          <section className="links-card">
            <div className="section-heading">
              <div>
                <h3>Your links</h3>
                <p>
                  Manage your shortened URLs and view their performance.
                </p>
              </div>
            </div>

            {urlsLoading ? (
              <div className="empty-state">
                <p>Loading your links...</p>
              </div>
            ) : urls.length === 0 ? (
              <div className="empty-state">
                <h4>No links yet</h4>
                <p>Create your first short URL to see it here.</p>
              </div>
            ) : (
              <div className="links-list">
                {urls.map((url) => (
                  <article className="link-row" key={url.id}>
                    <div className="link-main">
                      <a
                        href={`http://localhost:3001/${url.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        http://localhost:3001/{url.shortCode}
                      </a>
                      <p>{url.originalUrl}</p>
                    </div>

                    <div className="link-stats">
                      <span>{url.clickCount} clicks</span>
                      <span>
                        {new Date(url.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">SHORTLY</p>
          <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            {authMode === "login"
              ? "Log in to manage your shortened URLs."
              : "Create an account to start shortening URLs."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button className="primary-button auth-button" disabled={loading}>
            {loading
              ? "Please wait..."
              : authMode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {authMode === "login" ? (
            <>
              <span>Don't have an account?</span>
              <button onClick={() => setAuthMode("register")}>
                Create one
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button onClick={() => setAuthMode("login")}>
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
