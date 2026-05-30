import NotFoundUfo from "@/components/NotFoundUfo";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__stack">
        <NotFoundUfo />
        <div className="not-found__message">
          <h1 className="not-found__code">404</h1>
          <div className="not-found__desc">
            <h2>This page could not be found.</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
