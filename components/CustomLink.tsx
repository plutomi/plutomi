export default function CustomLink({ url, text }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="underline text-blue-gray-900 font-semibold hover:text-blue-500 transition ease-in-out duration-300"
    >
      {text}
    </a>
  );
}
