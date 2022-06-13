/** index.ts
 * Copyright (c) 2022, Towechlabs
 * All rights reserved
 *
 * Main file for the worker of the masordenTools service
 *
 * Starts the http server to listen for requests and sets up the automatc cron
 */

// Imports the environment variables
import dotenv from 'dotenv';
dotenv.config();

// Libraries
const nodeMailer = require('nodemailer'); // eslint-disable-line @typescript-eslint/no-var-requires
import * as fs from 'fs';
import { google } from 'googleapis';
import AdmZip from 'adm-zip';
import cron from 'node-cron';
import express from 'express';
import jwt_decode from 'jwt-decode';
import logger from 'tow96-logger';
import mailgen from 'mailgen';
import mongoose from 'mongoose';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

// Other files
import DB from './database';
import * as Models from './models';
import HttpRequester from './httpRequester';
import swaggerDoc from './swagger';

// Main Class
class MasOrdenTool {
  // Gets the variables from the .env
  private static port = process.env.PORT || 3000;
  private static corsOrigin = process.env.CORS_ORIGIN;
  private static databaseUrl = process.env.DATABASE_URL || '';
  private static cronOnStart = process.env.SCHEDULE_ONSTART || false;

  private static connectToDB = (): void => {
    mongoose
      .connect(MasOrdenTool.databaseUrl)
      .then(() => {
        logger.info('Connected to database');
        if (MasOrdenTool.cronOnStart === true) {
          MasOrdenTool.schedule.start();
          logger.info('Started schedule');
        }
      })
      .catch((err) => {
        if (MasOrdenTool.databaseUrl !== '') {
          logger.error(`${err}`);
          logger.info('Process exited with code 1');
        } else {
          logger.error('No Mongo url provided, exiting with error 1');
        }
        process.exit(1);
      });
  };

  static startServer = async () => {
    MasOrdenTool.connectToDB();

    // Sets up the server
    const app = express();
    app.set('port', this.port);

    // Middleware

    // use JSON bodyparser
    app.use(express.json());

    // morgan: allows the console to provide http protocol logs (only outside of production)
    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('dev'));
    }

    // CORS: enabled on the env file
    if (process.env.ENABLE_CORS === 'true') {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', this.corsOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        // Provide pre-flight authorization
        if ('OPTIONS' === req.method) {
          res.sendStatus(204);
        } else {
          next();
        }
      });
      logger.info('CORS enabled');
    }

    // Routes, theres only a couple of routes for this service, there is no need to create a separate file for them
    app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

    app.post('/run', (__, res) => {
      MasOrdenTool.requestFiles();
      res.sendStatus(200);
    });

    // Add user
    app.post('/users', async (req, res) => {
      const nuUser = req.body as Models.BackendUser;

      const userExists = await DB.userExists(nuUser.username);
      if (userExists !== null) return res.status(422).send({ error: 'User already registered' });

      await DB.addUser(nuUser);
      logger.info(`Added user ${nuUser.username}`);

      res.sendStatus(200);
    });

    // Edit user
    app.patch('/users', async (req, res) => {
      const editedUser = req.body as Models.BackendUser;

      const userExists = await DB.userExists(editedUser.username);
      if (userExists === null) return res.status(422).send({ error: `User doesn't exist` });

      const contents = {} as Models.BackendUser;

      if (editedUser.clientId) {
        if (editedUser.clientId !== userExists.clientId) {
          contents.clientId = editedUser.clientId;
        }
      }

      if (editedUser.email) {
        if (editedUser.email !== userExists.email) {
          contents.email = editedUser.email;
        }
      }

      if (editedUser.name) {
        if (editedUser.name !== userExists.name) {
          contents.name = editedUser.name;
        }
      }

      if (editedUser.password) {
        if (editedUser.password !== userExists.password) {
          contents.password = editedUser.password;
        }
      }

      if (Object.keys(contents).length < 1) {
        return res.sendStatus(204);
      }

      await DB.updateUser(userExists._id, contents);
      logger.info(`Edited user ${editedUser.username}`);

      res.sendStatus(200);
    });

    // Delete user
    app.delete('/users', async (req, res) => {
      const deletedUser = req.body as Models.BackendUser;

      await DB.deleteUser(deletedUser.username);
      logger.info(`Deleted user ${deletedUser.username}`);

      res.sendStatus(200);
    });

    // Start timer
    app.get('/timer/start', (__, res) => {
      logger.info('Started schedule');
      MasOrdenTool.schedule.start();
      res.sendStatus(200);
    });

    app.get('/timer/stop', (__, res) => {
      logger.info('Stopped schedule');
      MasOrdenTool.schedule.stop();
      res.sendStatus(200);
    });

    // Starts the server
    app.listen(app.get('port'), () => {
      logger.info(`Server running on port: ${app.get('port')}`);
    });
  };

  static requestFiles = async (): Promise<void> => {
    // Fetches all users from DB
    const users = await DB.getUsers();
    const receiptIds = (await DB.getIds())[0];

    // Logs into every user and fetches every missing receipt
    for (const user of users) {
      logger.info(`Fetching for user: ${user.username}`);
      const http = new HttpRequester();

      // Data
      let auth = {} as Models.LoginResponse;
      let userId = {} as Models.idTokenDecoded;
      let receiptData = [] as Models.Receipt[];
      const fetchedList = [] as string[];

      // Logs into Mas Orden
      logger.info(`-- Logging into +Orden`);
      try {
        const res = await http.login(user);
        auth = res.data;

        // Decode and extract the autouser id from the idToken
        userId = jwt_decode(auth.AuthenticationResult.IdToken);

        // Starts the companies session by providing the session Id and the autoid
        await http.startCompaniesSession(
          userId['custom:guid'],
          userId.sessionId,
          auth.AuthenticationResult.AccessToken,
        );
      } catch (e: any) {
        logger.error(e);
        continue;
      }

      // Fetches all the receipts
      logger.info(`-- Checking for new receipts`);
      try {
        // Fetches the companies the session can call upon
        const companyRes = await http.getCompanies(userId.sessionId, auth.AuthenticationResult.AccessToken);

        // Goes through every company, gets the receipt id's for them and downloads them
        for (const company of companyRes.data) {
          // Request Receipt data
          const receiptRes = await http.getReceiptIds(
            userId['custom:guid'],
            company.EmpresaID,
            auth.AuthenticationResult.AccessToken,
          );

          receiptData = receiptRes.data;

          // Creates the temporary directory
          if (!fs.existsSync(`./temp/`)) {
            fs.mkdirSync(`./temp/`);
          }

          if (!fs.existsSync(`./temp/${userId['custom:guid']}`)) {
            fs.mkdirSync(`./temp/${userId['custom:guid']}`);
          }
          // Goes through every receipt, and downloads the data
          for (const receipt of receiptData) {
            // Fetches only if the receipts haven't been already fetched
            if (receiptIds.ids.indexOf(receipt.FacturaUUID) == -1) {
              logger.info(`---- Fetching file for ${receipt.FacturaUUID}`);

              // Refreshes the token
              const refresh = await http.refresh(user.clientId, auth.AuthenticationResult.RefreshToken);
              auth = refresh.data;

              // Creates the temporary directory for the receipt
              if (!fs.existsSync(`./temp/${userId['custom:guid']}/${receipt.FacturaUUID}`)) {
                fs.mkdirSync(`./temp/${userId['custom:guid']}/${receipt.FacturaUUID}`);
              }

              // Gets the xml
              logger.info('------ Fetching XML');
              const xml = await http.getXML(receipt.FacturaUUID, auth.AuthenticationResult.AccessToken);
              fs.writeFileSync(
                `./temp/${userId['custom:guid']}/${receipt.FacturaUUID}/${receipt.PeriodoNombre}.xml`,
                xml.data,
              );

              // Gets the pdf
              logger.info('------ Fetching PDF');
              const pdf = await http.getPDF(receipt.FacturaUUID, auth.AuthenticationResult.AccessToken);

              fs.writeFileSync(
                `./temp/${userId['custom:guid']}/${receipt.FacturaUUID}/${receipt.PeriodoNombre}.pdf`,
                pdf.data,
              );

              // Adds the id to the already fetched list
              fetchedList.push(receipt.FacturaUUID);
            }
          }
        }
      } catch (e) {
        logger.error(e);
        // If there is an error when writing the petitions, logs out
        await http.logout(auth.AuthenticationResult.AccessToken);
      }

      // Logs out of +Orden
      logger.info(`-- Logging out from +Orden`);
      try {
        await http.logout(auth.AuthenticationResult.AccessToken);
      } catch (e) {
        logger.error(e);
      }

      if (fetchedList.length === 0) {
        logger.info('-- No new receipts to fecth');
        logger.debug('-- Done');
        continue;
      }

      // Zips the files
      logger.info('-- Zipping');
      if (!fs.existsSync(`./temp/${userId['custom:guid']}/zips`)) {
        fs.mkdirSync(`./temp/${userId['custom:guid']}/zips`);
      }
      for (const receipt of receiptData) {
        // If both xml and pdf files don't exist, skips the file
        if (
          !fs.existsSync(`./temp/${userId['custom:guid']}/${receipt.FacturaUUID}/${receipt.PeriodoNombre}.xml`) ||
          !fs.existsSync(`./temp/${userId['custom:guid']}/${receipt.FacturaUUID}/${receipt.PeriodoNombre}.pdf`)
        )
          continue;

        const zip = new AdmZip();
        zip.addLocalFile(`./temp/${userId['custom:guid']}/${receipt.FacturaUUID}/${receipt.PeriodoNombre}.xml`);
        zip.addLocalFile(`./temp/${userId['custom:guid']}/${receipt.FacturaUUID}/${receipt.PeriodoNombre}.pdf`);
        zip.writeZip(`./temp/${userId['custom:guid']}/zips/${receipt.PeriodoNombre}.zip`);
      }

      // Sends the zip files
      logger.info('-- Sending mail');
      await MasOrdenTool.sendMail(
        user.email,
        `./temp/${userId['custom:guid']}/zips`,
        fs.readdirSync(`./temp/${userId['custom:guid']}/zips`),
      );

      logger.info('-- Updating fetched list');
      DB.updateIds(fetchedList);

      logger.info('-- Cleaning temp folder');
      fs.rmSync(`./temp/${userId['custom:guid']}`, { recursive: true, force: true });

      logger.debug('-- Done');
    }
  };

  static sendMail = async (recipient: string, root: string, files: string[]): Promise<void> => {
    const name = 'Tow';

    try {
      const { EMAIL, EMAIL_CLIENT_ID, EMAIL_CLIENT_SECRET, EMAIL_REFRESH_TOKEN } = process.env;
      const OAuth2 = google.auth.OAuth2;
      const OAuth2_client = new OAuth2(
        EMAIL_CLIENT_ID,
        EMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground',
      );
      OAuth2_client.setCredentials({ refresh_token: EMAIL_REFRESH_TOKEN });

      // creates an instance of the mail generator, that has all the common elements
      const mailGenerator = new mailgen({
        theme: 'default',
        product: {
          name: 'Towechlabs',
          link: 'github.com/Tow96/MasOrdenTool',
          //TODO: Create and add logo
          //logo: 'https://avatars3.githubusercontent.com/u/11511711?s=460&u=9f55fbd68f05113f749132b9ca966e34b6337cf0&v=4'
        },
      });

      // Content of the mail
      const content: mailgen.Content = {
        body: {
          greeting: `Hola`,
          name: name,
          intro: `Se detectaron archivos nuevos en tu cuenta de más orden`,
          signature: `Atentamente`,
        },
      };

      const body = mailGenerator.generate(content);
      const text = mailGenerator.generatePlaintext(content);

      // Gets a new Access Token for the email
      const accessToken = await new Promise((resolve, reject) => {
        OAuth2_client.getAccessToken((err, token) => {
          if (err) {
            reject(err);
          }
          resolve(token);
        });
      });

      // Creates the Mail transport
      const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: EMAIL,
          accessToken: accessToken,
          clientId: EMAIL_CLIENT_ID,
          clientSecret: EMAIL_CLIENT_SECRET,
          refreshToken: EMAIL_REFRESH_TOKEN,
        },
      });

      const attachments: { path: string }[] = [];
      files.forEach((file) => {
        attachments.push({ path: `${root}/${file}` });
      });

      //const info = await transporter.sendMail({
      await transporter.sendMail({
        from: `Towechlabs <${EMAIL}>`,
        to: recipient,
        subject: 'Nuevos recibos en MasOrden',
        text: text,
        html: body,
        attachments: attachments,
      });

      logger.info(`Sent email to: ${recipient}`);
    } catch (e) {
      logger.error(e);
    }
  };

  // Automatically runs the job every day at 03:00
  private static schedule = cron.schedule('0 3 * * *', MasOrdenTool.requestFiles, {
    scheduled: false,
  });
}

MasOrdenTool.startServer().catch((err: any) => {
  logger.error(err);
  logger.error('Exiting app with code 1');
  process.exit(1);
});
