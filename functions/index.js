const functions = require('firebase-functions')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const crypto = require('crypto')

// ler configs das envs
const bucket = functions.config().aws.bucket
const region = functions.config().aws.region
const accessKeyId = functions.config().aws.access_key_id
const secretAccessKey = functions.config().aws.secret_access_key

const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey }
})

// Função HTTP: devolve URL pré-assinada para upload + URL pública
exports.getVideoUploadUrl = functions.https.onRequest(async (req, res) => {
  // CORS simples
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method not allowed')
    }

    const { fileName, fileType } = req.body || {}
    if (!fileName || !fileType) {
      return res.status(400).send('fileName e fileType são obrigatórios')
    }

    const key = `videoaulas/${crypto.randomUUID()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }) // 15 min
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return res.json({ uploadUrl, publicUrl })
  } catch (e) {
    console.error('Erro ao gerar URL de upload:', e)
    res.status(500).send('Erro ao gerar URL de upload')
  }
})