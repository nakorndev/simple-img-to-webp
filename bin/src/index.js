#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ora_classic_1 = __importDefault(require("ora-classic"));
const package_json_1 = __importDefault(require("../package.json"));
commander_1.program
    .version(package_json_1.default.version)
    .description(package_json_1.default.description)
    .argument('<path>', 'Path to directory contains any file of image to be convert into .webp')
    .action((pathArg) => __awaiter(void 0, void 0, void 0, function* () {
    const loading = (0, ora_classic_1.default)();
    loading.start();
    const files = fs_1.default.readdirSync(pathArg, { withFileTypes: true })
        .filter(it => it.isFile())
        .map(it => it.name);
    loading.text = `Processing total ${files.length} files.`;
    const outputDir = path_1.default.join(pathArg, './_output');
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir);
    }
    const result = yield Promise.allSettled(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const currentFile = path_1.default.join(pathArg, file);
        const targetFile = path_1.default.join(outputDir, `${path_1.default.parse(file.replace(/\s/g, '_')).name}.webp`);
        try {
            yield (0, sharp_1.default)(currentFile)
                .webp({ quality: 95 })
                .toFile(targetFile);
            return `✅ ${currentFile} --> ${targetFile}`;
        }
        catch (error) {
            throw new Error(`(❌ ${currentFile}): ${error}`);
        }
    })));
    loading.succeed('Done');
    console.log(result);
    process.exit(0);
}));
commander_1.program.parse();
