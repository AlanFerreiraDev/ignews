import { NextApiRequest, NextApiResponse } from 'next';

export default (request: NextApiRequest, response: NextApiResponse) => {
  console.log(request.query);

  const users = [
    { id: 1, name: 'Alan' },
    { id: 2, name: 'Jaqueline' },
    { id: 3, name: 'Rafael' },
  ];

  return response.json(users);
};
