import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { Handler, NextFunction, Request, Response } from 'express';

export const withEntityManager = (
  req: Request,
  _res: Response,
  orm: MikroORM<MongoDriver>,
  next: NextFunction,
) => {
  req.entityManager = orm.em.fork();
  next();
};
