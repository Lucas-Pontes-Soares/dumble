import ReactMarkdown from 'react-markdown';

export default function ConversorMDtoHTML({ message }: { message: string }) {
  return (
    <ReactMarkdown>{message}</ReactMarkdown>
  );
}