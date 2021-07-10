import { Controller } from '@pxp-nd/core';
import {
  Route,
  Model
} from '@pxp-nd/core';

@Route('/configs')
@Model('common/Config')
class Config extends Controller {

}

export default Config;
