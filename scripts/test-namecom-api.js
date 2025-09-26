#!/usr/bin/env node

/**
 * Test script for name.com API connection
 * Run with: node scripts/test-namecom-api.js
 */

require('dotenv').config();

async function testNamecomAPI() {
  const username = process.env.NAMECOM_USERNAME;
  const token = process.env.NAMECOM_API_TOKEN;
  const useCore = process.env.NAMECOM_USE_CORE === 'true';
  const baseUrl = useCore 
    ? (process.env.NAMECOM_CORE_API || 'https://api.name.com')
    : (process.env.NAMECOM_API_BASE || 'https://api.name.com/v4');

  console.log('Testing name.com API connection...');
  console.log('-----------------------------------');
  console.log('API Type:', useCore ? 'Core API' : 'v4 API (Legacy)');
  console.log('Base URL:', baseUrl);
  console.log('Username:', username ? `${username.substring(0, 3)}***` : 'NOT SET');
  console.log('Token:', token ? 'SET' : 'NOT SET');
  console.log('');

  if (!username || !token) {
    console.error('❌ Error: Missing credentials!');
    console.error('Please set NAMECOM_USERNAME and NAMECOM_API_TOKEN in your .env file');
    process.exit(1);
  }

  // Create Basic Auth header
  const auth = Buffer.from(`${username}:${token}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  try {
    if (useCore) {
      // Test Core API
      console.log('Testing Core API endpoint: /domains:checkAvailability');
      const testDomain = 'example-test-' + Date.now() + '.com';
      
      const response = await fetch(`${baseUrl}/domains:checkAvailability`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          domainNames: [testDomain]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Core API connection successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      // Test v4 API
      console.log('Testing v4 API endpoint: /domains:check');
      const testDomain = 'example-test-' + Date.now() + '.com';
      
      const response = await fetch(`${baseUrl}/domains:check`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          domainNames: [testDomain]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ v4 API connection successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

    console.log('\n✨ API test completed successfully!');
    console.log('\nTroubleshooting tips:');
    console.log('- For production: Use your regular username and API token');
    console.log('- For testing: Add -test suffix to username and use test token');
    console.log('- For Core API dev: Set NAMECOM_CORE_API=https://api.dev.name.com');
    console.log('- For v4 API dev: Set NAMECOM_API_BASE=https://api.dev.name.com/v4');
    
  } catch (error) {
    console.error('❌ API test failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('Common issues:');
    console.error('1. Wrong username format (use username, not email)');
    console.error('2. Invalid or expired API token');
    console.error('3. Using production credentials on dev API or vice versa');
    console.error('4. Missing -test suffix for test environment');
    console.error('');
    console.error('To fix:');
    console.error('1. Verify your credentials at https://www.name.com/account/settings/api');
    console.error('2. Check if you need the -test suffix for your username');
    console.error('3. Ensure your API token matches the environment (prod vs test)');
    process.exit(1);
  }
}

// Run the test
testNamecomAPI().catch(console.error);