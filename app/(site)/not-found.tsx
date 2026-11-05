import { NotFoundBody } from "@/components/not-found-body";

/* notFound() inside the public pages (an unknown article slug): the (site) layout already draws the chrome. */
export default function NotFound() {
  return (
    <div className="container-page">
      <NotFoundBody />
    </div>
  );
}
