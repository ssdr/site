import fs from 'fs'
import path from 'path'

const datetime = process.argv[2]
const filename = process.argv[3]
const content = process.argv[4]

const alphabets = [...'umoacenrvwz']
const idx = fs.readdirSync('images').filter(p => p.startsWith(datetime.split(' ')[0])).length
const a = alphabets[idx]
const filePath = `images/${datetime.split(' ')[0]}-${filename}-${a}${a}.jpg`

const img = Buffer.from(content, 'base64').toString('binary')

fs.writeFileSync(filePath, img)
