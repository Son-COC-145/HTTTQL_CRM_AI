import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ page, setPage, children }) {
  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />

      <main className="main-area">
        <Header />

        <section className="content-area">{children}</section>
      </main>
    </div>
  );
}

export default Layout;