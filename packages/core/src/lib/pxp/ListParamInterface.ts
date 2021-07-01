/**
 * Kplian Ltda 2020
 *
 * MIT
 *
 * Interface used to validate params to send to typeorm entity
 *
 * @summary Interface used to validate params to send to typeorm entity
 * @author Jaime Rivera
 *
 * Created at     : 2020-06-13 18:09:48
 * Last modified  : 2020-09-17 18:26:44
 */
export interface ListParam {
  where?: {
    [key: string]: any;
  };
  skip?: number;
  take?: number;
  order?: {
    [key: string]: string;
  };
}