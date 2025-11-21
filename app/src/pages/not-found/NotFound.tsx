export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-xl mt-4">Página Não Encontrada</p>
      <p className="text-md mt-2 text-gray-600">A rota que você tentou acessar não existe.</p>
    </div>
  );
}
