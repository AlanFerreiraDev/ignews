// Rota do Backend do Next
// Prém sempre se lembrar que nossa logica de pagamento, senha, autenticação deve ser feita sempre no back-end, para não abrir questões de segurança.
// API Routes, executadas como Serverlless, não existe um servidor express por exemplo, mas toda vez q a rota é chamada, ele vai chamar um ambiente isolado e executar a função, a partir do momento que ela devolver uma resposta, ela encerra a execução do ambiente.

import { NextApiRequest, NextApiResponse } from 'next';

export default (request: NextApiRequest, response: NextApiResponse) => {
  const users = [
    { id: 1, name: 'Alan' },
    { id: 2, name: 'Jaqueline' },
    { id: 3, name: 'Rafael' },
  ];

  return response.json(users);
};

// Estratégias de Autenticação
// JWT (Storage)
// NextAuth (Social Login)
// Cognito, Auth0
