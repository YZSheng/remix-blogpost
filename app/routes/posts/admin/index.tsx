import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <p>
      <Link to="new" className="text-blue-600 rounded border py-1 px-4 border-gray-800">
        Create a New Post
      </Link>
    </p>
  );
}