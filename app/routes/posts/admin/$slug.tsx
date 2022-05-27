import {
  LoaderFunction,
  json,
  ActionFunction,
  redirect,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { deletePost, getPost, updatePost } from "~/models/post.server";
import type { Post } from "~/models/post.server";
import { Form, useLoaderData } from "@remix-run/react";

type LoaderData = { post: Post };

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const method = request.method.toLowerCase();
  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  if (method === "put") {
    const errors: ActionData = {
      title: title ? null : "Title is required",
      slug: slug ? null : "Slug is required",
      markdown: markdown ? null : "Markdown is required",
    };
    const hasErrors = Object.values(errors).some(
      (errorMessage) => errorMessage
    );
    if (hasErrors) {
      return json<ActionData>(errors);
    }
    invariant(typeof title === "string", "title must be a string");
    invariant(typeof slug === "string", "slug must be a string");
    invariant(typeof markdown === "string", "markdown must be a string");
    await updatePost({ title, slug, markdown });
  } else if (method === "delete") {
    invariant(typeof slug === "string", "slug must be a string");
    await deletePost(slug);
  }

  return redirect("/posts/admin");
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);
  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);
  return json<LoaderData>({ post });
};

export default function EditPost() {
  const { post } = useLoaderData();
  return (
    <div>
      <h2 className="mb-2 text-2xl">Editing Post {post.title}</h2>
      <Form method="put" key={post.slug}>
        <p>
          <label>
            Post Title:{" "}
            <input
              type="text"
              name="title"
              className={inputClassName}
              defaultValue={post.title}
            />
          </label>
        </p>
        <input
          type="text"
          name="slug"
          hidden
          aria-hidden
          className={`text-gray-400 ${inputClassName}`}
          defaultValue={post.slug}
        />
        <p>
          <label htmlFor="markdown">Markdown: </label>
          <br />
          <textarea
            id="markdown"
            rows={20}
            name="markdown"
            defaultValue={post.markdown}
            className={`${inputClassName} font-mono`}
          />
        </p>
        <p className="text-right">
          <button
            type="submit"
            className="w-24 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          >
            Update
          </button>
        </p>
      </Form>
      <Form method="delete" className="my-2 text-right">
        <input
          type="text"
          name="slug"
          hidden
          aria-hidden
          defaultValue={post.slug}
        />
        <button
          type="submit"
          className="w-24 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}
