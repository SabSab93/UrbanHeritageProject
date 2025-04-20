declare namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      PORT?: string;
      DATABASE_URL?: string;
    }
  }
  

//“Je vais utiliser process.env.JWT_SECRET, donc sois gentil et dis pas que c’est string | undefined tout le temps.”