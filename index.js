const crypto = require("crypto")
const AWS = require("aws-sdk")
const iam = new AWS.IAM({ "apiVersion": "2010-05-08" })

const UserName = process.argv[2]
const fromAddress = process.argv[3]

const message = "SendRawEmail"
const versionInBytes = 0x02

const PolicyDocument = `{"Version":"2012-10-17","Statement":[{"Effect": "Allow","Action": "ses:SendRawEmail","Resource": "*","Condition":{"StringLike":{"ses:FromAddress":"${fromAddress}"}}}]}`

iam.createUser({ UserName }).promise()
  .then(() => iam.createAccessKey({ UserName }).promise())
  .then(({ "AccessKey": { AccessKeyId, SecretAccessKey } }) => {
    const smtpPassword = Buffer.concat([
      Buffer.from([versionInBytes]),
      crypto.createHmac("sha256", SecretAccessKey).update(message).digest()
    ]).toString("base64")
    console.log("AccessKeyId:", AccessKeyId),
    console.log("SecretAccessKey:", SecretAccessKey)
    console.log("smtpPassword:", smtpPassword)
  })
  .then(() => iam.putUserPolicy({ UserName, PolicyDocument, "PolicyName": "smtp-access" }).promise())
  .catch(err => { console.log(err) })
