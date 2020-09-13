import 'dotenv/config';
import App from './App';

const app = new App();
app
  .loadControllers()
  .then(() => {
    console.log('controllers loaded');
    app.listen();
  })
  .catch((err) => {
    console.log(err);
  });
