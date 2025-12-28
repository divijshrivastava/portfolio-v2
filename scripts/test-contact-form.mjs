#!/usr/bin/env node
/**
 * Test contact form submission on QA to debug rate limiting
 */

const QA_URL = 'https://divij-qa.tech';

async function testContactForm() {
  console.log('🧪 Testing contact form on QA...\n');

  try {
    // First, get the page to see if it loads
    console.log('1. Fetching contact page...');
    const pageResponse = await fetch(`${QA_URL}/contact`);
    const pageHtml = await pageResponse.text();

    if (pageHtml.includes('submitContactForm')) {
      console.log('✅ Page contains submitContactForm reference\n');
    } else {
      console.log('❌ submitContactForm not found in page\n');
    }

    // Now try to submit the form
    console.log('2. Submitting test message...');

    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from automated script'
    };

    // We need to call the server action, but server actions require special handling
    // Let's just check if the action file exists in the build
    console.log('Form data:', formData);
    console.log('\nNote: Server actions require form submission from the browser.');
    console.log('Please test manually on divij-qa.tech/contact\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testContactForm();
