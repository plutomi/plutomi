interface LoaderProps {
  text: string;
}

export default function Loader({ text }: LoaderProps) {
  return (
    <div className="mx-auto p-20 flex justify-center items-center">
      <h1 className="text-4xl text-dark font-medium">{text}</h1>
    </div>
  );
}
