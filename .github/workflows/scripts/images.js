import fs from 'fs'
import path from 'path'

const datetime = process.argv[2]
const content = process.argv[3]

const alphabets = [...'abcdefghijklmnopqrstuvwxyz']
const idx = fs.readdirSync('images').filter(p => p.startsWith(datetime.split('T')[0])).length
const a = alphabets[idx]
const filePath = `images/${datetime.split('T')[0]}-${a}${a}.jpg`

const img = Buffer.from(content, 'base64')

fs.writeFileSync(filePath, img)
