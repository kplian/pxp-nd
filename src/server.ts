import 'dotenv/config';
import App from './App';

const app = new App();
app.loadControllers()
  .then(() => {
    console.log('controllers loaded');
  })
  .catch(err => {
    console.log(err);
  });
app.listen();