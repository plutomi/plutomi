import { baseAPIUrl } from "@/utils";

// Function getData that calls localhost on 8080 /api/health and returns the text
async function getData() {
  const response = await fetch(`${baseAPIUrl}/api/health`);
  const data = await response.text();
  return data;
}

export default async function Server() {
  const data = await getData();
  return (
    <div>
      <h1>Test</h1>
      <p>{data}</p>
    </div>
  );
}
