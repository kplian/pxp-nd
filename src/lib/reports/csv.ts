import converter from 'json-2-csv';
import fs from 'fs';
import path from 'path';

export const makeCsv = async (req: any, res: any) => {
  try {
    const filename = req.body.filename || req.query.filename;
    const csvPath = path.join(__dirname, filename + '.csv');

    console.log('NAME', csvPath, __dirname);

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="' + filename + '" '
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-type: text/csv');
    // res.attachment(filename);
    // res.setHeader('Content-Type', 'application/pdf');

    const csv = await converter.json2csvAsync([
      {
        id: 1,
        title: 'delectus aut autem',
        completed: false
      },
      {
        id: 2,
        title: 'quis ut nam facilis et officia qui',
        completed: false
      },
      {
        id: 3,
        title: 'fugiat veniam minus',
        completed: false
      }
    ]);

    // print CSV string
    console.log(csv, csvPath);

    // write CSV to a file
    fs.writeFileSync(csvPath, csv);
    // fs.createWriteStream(csvPath, csv);
    res.status(csv);
  } catch (err) {
    res.status(400).json({ message: 'An error occured in process' });
  }
};
