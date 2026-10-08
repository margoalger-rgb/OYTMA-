import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const sourcePath = path.join(projectRoot, 'WEBSITE-DOCUMENTATION.md')
const outputPath = path.join(projectRoot, 'public', 'website-documentation.pdf')
const markdown = await readFile(sourcePath, 'utf8')
const sections = markdown.split(/\r?\n/)
const document = new PDFDocument({
  size: 'A4',
  margins: { top: 58, right: 56, bottom: 58, left: 56 },
  bufferPages: true,
  info: {
    Title: 'Oyo Traffic Website — As-Built Documentation',
    Author: 'Oyo Traffic Website',
    Subject: 'Website sections, data handling, technical stack, and operational status',
    Creator: 'Website documentation PDF generator',
  },
})

const chunks = []
document.on('data', (chunk) => chunks.push(chunk))
const finished = new Promise((resolve, reject) => {
  document.on('end', resolve)
  document.on('error', reject)
})

function stripInlineMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\\([\\`*_{}\[\]()#+\-.!])/g, '$1')
    .trim()
}

function ensureRoom(height = 36) {
  if (document.y + height > document.page.height - document.page.margins.bottom) {
    document.addPage()
  }
}

function addSectionHeading(text) {
  ensureRoom(54)
  document.moveDown(0.8)
  document.font('Helvetica-Bold').fontSize(14).fillColor('#1e4030').text(text, { lineGap: 2 })
  document.moveDown(0.3)
  document.strokeColor('#d9e4da').lineWidth(1).moveTo(document.page.margins.left, document.y).lineTo(document.page.width - document.page.margins.right, document.y).stroke()
  document.moveDown(0.65)
}

function addSubheading(text) {
  ensureRoom(34)
  document.moveDown(0.45)
  document.font('Helvetica-Bold').fontSize(10).fillColor('#263746').text(text)
  document.moveDown(0.2)
}

function addParagraph(text) {
  const cleaned = stripInlineMarkdown(text)
  if (!cleaned) return
  ensureRoom(25)
  document.font('Helvetica').fontSize(9).fillColor('#35434b').text(cleaned, { lineGap: 3, paragraphGap: 1 })
  document.moveDown(0.38)
}

function addListItem(text, ordered) {
  const cleaned = stripInlineMarkdown(text)
  ensureRoom(28)
  document.font('Helvetica').fontSize(9).fillColor('#35434b')
  document.text(ordered ? `${ordered}.  ${cleaned}` : `•  ${cleaned}`, {
    indent: ordered ? 5 : 7,
    hanging: 4,
    lineGap: 2.5,
    paragraphGap: 3,
  })
  document.moveDown(0.16)
}

// Branded cover page with the document's official-service caveat visible up front.
document.rect(0, 0, document.page.width, document.page.height).fill('#f7f8f3')
document.rect(0, 0, document.page.width, 15).fill('#246044')
document.font('Helvetica-Bold').fontSize(10).fillColor('#246044').text('OYO TRAFFIC  /  WEBSITE DOCUMENTATION', 56, 76, { characterSpacing: 1.1 })
document.moveDown(5)
document.font('Helvetica-Bold').fontSize(32).fillColor('#172b3a').text('Oyo Traffic Website', 56, 190, { width: 450 })
document.moveDown(0.45)
document.font('Helvetica').fontSize(17).fillColor('#246044').text('As-Built Documentation', { width: 430 })
document.moveDown(0.8)
document.font('Helvetica').fontSize(11).fillColor('#586870').text('A practical guide to the website’s sections, interactions, data handling, technology, and service status.', { width: 420, lineGap: 5 })
document.roundedRect(56, 397, document.page.width - 112, 92, 5).fill('#e8eee6')
document.font('Helvetica-Bold').fontSize(9).fillColor('#1e4030').text('IMPORTANT SERVICE STATUS', 72, 415)
document.font('Helvetica').fontSize(9).fillColor('#35434b').text('This document describes a public-information website. Official authorization has not been established. Live traffic, vehicle tracking, and official vehicle-record verification are not connected.', 72, 436, { width: document.page.width - 160, lineGap: 4 })
document.font('Helvetica').fontSize(8).fillColor('#78837e').text('Implementation reference  •  English  •  A4', 56, document.page.height - 80)

document.addPage()
document.y = document.page.margins.top

let paragraphLines = []
let bodyStarted = false

function flushParagraph() {
  if (paragraphLines.length) {
    addParagraph(paragraphLines.join(' '))
    paragraphLines = []
  }
}

for (const line of sections) {
  const trimmed = line.trim()
  if (!bodyStarted) {
    if (trimmed.startsWith('# ')) bodyStarted = true
    continue
  }

  if (!trimmed || /^---+$/.test(trimmed)) {
    flushParagraph()
    continue
  }

  const h2 = trimmed.match(/^##\s+(.+)$/)
  if (h2) {
    flushParagraph()
    addSectionHeading(stripInlineMarkdown(h2[1]))
    continue
  }

  const h3 = trimmed.match(/^###\s+(.+)$/)
  if (h3) {
    flushParagraph()
    addSubheading(stripInlineMarkdown(h3[1]))
    continue
  }

  const ordered = trimmed.match(/^(\d+)\.\s+(.+)$/)
  if (ordered) {
    flushParagraph()
    addListItem(ordered[2], ordered[1])
    continue
  }

  const bullet = trimmed.match(/^[-*]\s+(.+)$/)
  if (bullet) {
    flushParagraph()
    addListItem(bullet[1])
    continue
  }

  paragraphLines.push(trimmed)
}
flushParagraph()

const pageRange = document.bufferedPageRange()
for (let index = pageRange.start; index < pageRange.start + pageRange.count; index += 1) {
  if (index === 0) continue
  document.switchToPage(index)
  document.font('Helvetica').fontSize(7.5).fillColor('#7b8780')
  document.text('Oyo Traffic Website  ·  As-Built Documentation', document.page.margins.left, document.page.height - 37, { lineBreak: false })
  document.text(`${index + 1} / ${pageRange.count}`, document.page.width - document.page.margins.right - 60, document.page.height - 37, { width: 60, align: 'right', lineBreak: false })
}

document.end()
await finished
await writeFile(outputPath, Buffer.concat(chunks))
console.log(`Created ${path.relative(projectRoot, outputPath)}`)
