import { notFound } from "next/navigation";

// any address no room claims: show the library's own not-found page, in the visitor's language
export default function Unknown() {
  notFound();
}
