import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Shortly</h1>
          <p>URL Shortener</p>
        </div>

        <button className="logout-button">Log out</button>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">URL MANAGEMENT</p>
            <h2>Create and manage your short links</h2>
            <p className="hero-text">
              Turn long URLs into short, shareable links and track their
              performance.
            </p>
          </div>
        </section>

        <section className="create-card">
          <div className="section-heading">
            <div>
              <h3>Create a short URL</h3>
              <p>Paste a destination URL to generate a short link.</p>
            </div>
          </div>

          <form className="url-form">
            <label>
              Destination URL
              <input
                type="url"
                placeholder="https://example.com/very-long-url"
              />
            </label>

            <label>
              Custom alias <span>(optional)</span>
              <input type="text" placeholder="my-link" />
            </label>

            <button type="submit" className="primary-button">
              Create short URL
            </button>
          </form>
        </section>

        <section className="links-card">
          <div className="section-heading">
            <div>
              <h3>Your links</h3>
              <p>Manage your shortened URLs and view their performance.</p>
            </div>
          </div>

          <div className="empty-state">
            <h4>No links yet</h4>
            <p>Create your first short URL to see it here.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
