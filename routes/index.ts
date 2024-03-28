import express from 'express';
import {router} from './users';

const newRouter = express.Router();

newRouter.use('/users', router);

export {newRouter}