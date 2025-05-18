const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for reading input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// File path for .env.local
const envFilePath = path.join(__dirname, '.env.local');

console.log('\n=== Supabase Environment Setup ===\n');
console.log('This script will help you create a .env.local file with your Supabase credentials.\n');

// Check if file already exists
if (fs.existsSync(envFilePath)) {
  console.log('A .env.local file already exists. Do you want to overwrite it?');
  rl.question('Overwrite? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      promptForCredentials();
    } else {
      console.log('\nSetup cancelled. Your existing .env.local file was not modified.');
      rl.close();
    }
  });
} else {
  promptForCredentials();
}

function promptForCredentials() {
  console.log('\nPlease enter your Supabase credentials:');
  console.log('(You can find these in your Supabase project settings > API)\n');
  
  rl.question('Supabase URL (e.g. https://project-id.supabase.co): ', (supabaseUrl) => {
    rl.question('Supabase Anon Key: ', (supabaseKey) => {
      // Generate content for .env.local
      const envContent = generateEnvContent(supabaseUrl, supabaseKey);
      
      // Write to .env.local
      fs.writeFileSync(envFilePath, envContent);
      
      console.log('\n✅ .env.local file has been created successfully!');
      console.log(`   Location: ${envFilePath}`);
      console.log('\n🚀 You can now start your application with: npm start');
      
      rl.close();
    });
  });
}

function generateEnvContent(url, key) {
  // Detect if using Create React App or Next.js based on package.json
  let packageJson;
  try {
    packageJson = require('./package.json');
  } catch (error) {
    // Default to React App if package.json not found
    packageJson = { dependencies: { react: true } };
  }
  
  // Check for Next.js
  const isNextJs = packageJson.dependencies && (
    packageJson.dependencies.next || 
    packageJson.devDependencies && packageJson.devDependencies.next
  );
  
  const prefix = isNextJs ? 'NEXT_PUBLIC_' : 'REACT_APP_';
  
  return `# Supabase Environment Variables
# Generated on: ${new Date().toISOString()}
${prefix}SUPABASE_URL=${url}
${prefix}SUPABASE_ANON_KEY=${key}

# Keep this file private and do not commit it to version control
`;
} 