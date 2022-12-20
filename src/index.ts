import { program } from 'commander'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import ora from 'ora-classic'
import packageJson from '../package.json'

program
  .version(packageJson.version)
  .description(packageJson.description)
  .argument('<path>', 'Path to directory contains any file of image to be convert into .webp')
  .action(async (pathArg: string) => {
    const loading = ora()
    loading.start()
    const files = fs.readdirSync(pathArg, { withFileTypes: true })
      .filter(it => it.isFile())
      .map(it => it.name)
    loading.text = `Processing total ${files.length} files.`
    const outputDir = path.join(pathArg, './_output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }
    const result = await Promise.allSettled(files.map(async (file) => {
      const currentFile = path.join(pathArg, file)
      const targetFile = path.join(outputDir, `${path.parse(file.replace(/\s/g, '_')).name}.webp`)
      try {
        await sharp(currentFile)
          .webp({ quality: 95 })
          .toFile(targetFile)
        return `✅ ${currentFile} --> ${targetFile}`
      } catch (error) {
        throw new Error(`(❌ ${currentFile}): ${error}`)
      }
    }))
    loading.succeed('Done')
    console.log(result)
    process.exit(0)
  })

program.parse()
