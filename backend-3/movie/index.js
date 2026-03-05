import { Router } from 'express';
import { param } from 'express-validator';

import { listAction, detailAction, createAction, updateAction, deleteAction } from './controller.js';

const router = Router();

router.get('/', listAction);
router.get('/:id', detailAction);
router.post('/', createAction);
router.put('/:id', updateAction);
router.delete('/:id', param('id').isInt(), deleteAction);

export { router };
