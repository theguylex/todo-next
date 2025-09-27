import type { ReactElement } from "react";

export default function TestError(): ReactElement {
  if (process.env.NODE_ENV === "development") {
    throw new Error("Oops! This is a test error.");
  }
  return <div>Test Error Page</div>;
}
