import { Router } from 'express';

interface ControllerInterface {
  path: string;
  router: Router;
}

export default ControllerInterface;