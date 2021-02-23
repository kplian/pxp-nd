import { AES, enc } from 'crypto-js';

const encode = (value: string)=> {
  const ciphertext = AES.encrypt(value, String(process.env.SECRET)).toString();
  return ciphertext.replace(/\//g, '-PXP-');
};

const decode = (value: string)=> {
  value = value.replace(/-PXP-/g, '/');
  const  bytes  = AES.decrypt(value, String(process.env.SECRET));
  return bytes.toString(enc.Utf8);
}; 

export {
  encode,
  decode
}