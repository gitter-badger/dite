import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <script type="module" src="/@vite/client"></script>
        {title ? <title>{title}</title> : null}
        {/* <Meta /> */}
        {/* <Links /> */}
      </head>
      <body>
        {children}
        {/* <script type="module" src="./index.ts"></script> */}
        {/* <ScrollRestoration /> */}
        {/* <Scripts /> */}
        {/* <LiveReload /> */}
        <script type="module" src="/app/entry.client.tsx"></script>
      </body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dite-app">
      <header className="dite-app__header">
        <div className="container dite-app__header-content">
          <Link to="/" title="Dite" className="dite-app__header-home-link">
            {/* <DiteLogo /> */}
          </Link>
          <nav aria-label="Main navigation" className="dite-app__header-nav">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/hello">Hello</Link>
              </li>
              <li>
                <a href="https://dite.run/docs">Dite Docs</a>
              </li>
              <li>
                <a href="https://github.com/dite-run/dite">GitHub</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="dite-app__main">
        <div className="container dite-app__main-content">{children}</div>
      </div>
      <footer className="dite-app__footer">
        <div className="container dite-app__footer-content">
          <p>&copy; You!</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}
