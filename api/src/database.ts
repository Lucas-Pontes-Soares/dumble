// Singleton - Design Patterns

import { Pool, PoolClient, QueryResult } from 'pg';

export class Database {
  private static instance: Database;
  private pool: Pool;

  // O construtor é privado para impedir a criação de novas instâncias,
  private constructor() {

    if (!process.env.PGUSER || !process.env.PGHOST || !process.env.PGDATABASE || !process.env.PGPASSWORD) {
      throw new Error('Database configuration environment variables must be defined');
    }

    this.pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: 5432 // Porta padrão do PostgreSQL
    });

    // Adiciona um listener para a conexão e desconexão
    this.pool.on('connect', () => {
      console.log('Conexão com o banco de dados estabelecida.');
    });

    this.pool.on('error', (err) => {
      console.error('Erro inesperado na conexão com o banco de dados:', err);
      process.exit(-1);
    });
  }

  // O método `getInstance` é o ponto de entrada para obter a única instância da classe
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Método para executar uma query
  public async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release(); // Libera o cliente de volta para o pool
    }
  }

  // Opcional: método para fechar o pool de conexões
  public async closePool(): Promise<void> {
    await this.pool.end();
    console.log('Pool de conexões com o banco de dados fechado.');
  }
}