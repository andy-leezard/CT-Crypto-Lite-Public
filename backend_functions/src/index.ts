import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
const firestore_tools = require('firebase-tools');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

admin.initializeApp();
// using eslint --ext .js,.ts .
// https://firebase.google.com/docs/functions/typescript

export const deleteuser = functions.https.onRequest(async (req, res)=>{
  const userEmail = req.body.userEmail;

  admin.auth().getUserByEmail(userEmail)
    .then((user) => {
      const uid = user.uid
      return admin.auth().deleteUser(uid)
    })
    .then(()=>{
      console.log(`Successfully deleted user: ${userEmail}`);
      res.status(200).send(`Deleted User : ${userEmail}`);
    })
    .catch((error)=>{
      console.log('Error deleting user:', error);
      res.status(500).send('Faild');
    })
})

export const onUserDeleted = functions.auth.user().onDelete((user) => {
    const userEmail = user.email;
    const project = process.env.GCLOUD_PROJECT;
    const token = functions.config().ci_token;
    const path = `/users/${userEmail}`;

    console.log(`User ${userEmail} has requested to delete path ${path}`);

    return firestore_tools.firestore
      .delete(path, {
          project,
          token,
          recursive: true,
          yes: true,
      })
      .then(() => {
          console.log(`User data with ${userEmail} was deleted`);
      })
});

export const optimizeHistory = functions.https.onRequest(async (req, res)=>{
  const userEmail = req.body.userEmail;
  const db = admin.firestore();

  db.collection('users')
  .doc(userEmail)
  .collection('history')
  .orderBy("orderNum", "desc")
  .get()
  .then((querySnapshot)=>{
      var batch = db.batch();
      const limit = 100
      let index = 0
      querySnapshot.forEach(function(doc) {
        index ++;
        if(index > limit){
          batch.delete(doc.ref);
          console.log("Trade history id : ",doc.id," has been deleted.");
        }
      });
      if(index>limit){
        batch.commit();
        res.status(200).send(`Optimized history for : ${userEmail}`);
      }else{
        res.status(200).send(`Nothing to optimize for : ${userEmail}`);
      }
  })
  .catch((err)=>{
    console.log("Error optimizing history : ",err);
    res.status(500).send('Faild');
  })
})

export const whatsMyPIN = functions.https.onRequest((req, res) => {
  const db = admin.firestore();
  const userEmail = req.body.userEmail;
  let username = String();
  let pin = String();

  cors(req, res, () => {
    db.collection('users').doc(userEmail).get().then(function (doc) {
      username = (doc.exists) ? doc.data()?.username as string : "user";
      pin = (doc.exists) ? doc.data()?.pin as string : "error";
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'cointracer.userservice@gmail.com',
            pass: 'f4542db9ba30f7958'
        }
      });
    
      const mailOptions = {
          from: 'CoinTracer User Service <cointracer.userservice@gmail.com>',
          to: userEmail,
          subject: 'Your PIN Code',
          html: `
          <p>Hello <span style="font-weight:bold">${username}</span>,</p>
          
          <p>You have requested to recover your PIN code : <span style="font-weight:bold">${pin}</span>.</p>
          
          <p>If you didn’t request this verification, please reset your password as well for better security.</p>
          
          <p>Thanks,</p>
          
          <p>Your CoinTracer user service team</p>
          `
      };
      transporter.sendMail(mailOptions, (error:any, info:any) => {
          if(error){
              console.log("error trying to send a mail : ",error);
              return res.status(500).send(error);
          }
          console.log("sent email to :",username);
          return res.status(200).send(info as string);
      });
      }).catch((error)=>{
        console.log("error trying to send a mail : ",error);
      })
  });
});
