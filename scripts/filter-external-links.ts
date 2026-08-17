#!/usr/bin/env -S node --experimental-strip-types

import fs from 'node:fs'
import { externalLinkSource } from '../src/lib/external-link-source.ts'

const file = process.argv[2]
if (!file) throw new Error('Expected a source file path')

process.stdout.write(externalLinkSource(fs.readFileSync(file, 'utf8')))
