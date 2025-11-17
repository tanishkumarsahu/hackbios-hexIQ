#!/usr/bin/env node

/**
 * Migration Script: Old Sidebar → Optimized Sidebar
 * 
 * This script automatically updates all imports from the old Navigation
 * component to the new OptimizedNavigation component.
 * 
 * Usage: node migrate-sidebar.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, 'src', 'app');
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Counters
let filesScanned = 0;
let filesUpdated = 0;
let errors = [];

/**
 * Recursively find all files with specific extensions
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        findFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Update imports in a file
 */
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Pattern 1: Named import
    const pattern1 = /import\s*{\s*Navigation\s*}\s*from\s*['"].*\/components\/layout\/Navigation['"]/g;
    if (pattern1.test(content)) {
      content = content.replace(
        pattern1,
        "import { OptimizedNavigation } from '@/components/layout/OptimizedNavigation'"
      );
      updated = true;
    }

    // Pattern 2: Default import
    const pattern2 = /import\s+Navigation\s+from\s+['"].*\/components\/layout\/Navigation['"]/g;
    if (pattern2.test(content)) {
      content = content.replace(
        pattern2,
        "import OptimizedNavigation from '@/components/layout/OptimizedNavigation'"
      );
      updated = true;
    }

    // Pattern 3: Usage in JSX
    if (updated) {
      content = content.replace(/<Navigation>/g, '<OptimizedNavigation>');
      content = content.replace(/<\/Navigation>/g, '</OptimizedNavigation>');
      content = content.replace(/<Navigation\s/g, '<OptimizedNavigation ');
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesUpdated++;
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    }

    filesScanned++;
  } catch (error) {
    errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error in ${filePath}: ${error.message}`);
  }
}

/**
 * Main migration function
 */
function migrate() {
  console.log('🚀 Starting migration...\n');
  console.log(`📁 Scanning directory: ${SRC_DIR}\n`);

  // Find all files
  const files = findFiles(SRC_DIR);
  console.log(`📄 Found ${files.length} files to scan\n`);

  // Update each file
  files.forEach(updateFile);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(50));
  console.log(`Files scanned: ${filesScanned}`);
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Errors: ${errors.length}`);
  console.log('='.repeat(50));

  if (errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`);
    });
  }

  if (filesUpdated > 0) {
    console.log('\n✅ Migration complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Review the changes');
    console.log('  2. Test the application');
    console.log('  3. Run: npm run dev');
    console.log('  4. Check all pages work correctly');
  } else {
    console.log('\n✨ No files needed updating!');
  }
}

// Run migration
migrate();
